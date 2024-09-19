import { NextFunction, Request, Response } from "express";
import assert from "node:assert";
import { AccountDB, getDb } from "../../services/db";
import { Checkgroup, fetchByUsername } from "../../services/db/user_group";
import { generateToken, verifyToken } from "../../services/jwt";

/**
 * 1. Check Token validity
 * 2. Check `accountStatus` is active
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const validateCookie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;
  const ipAddress = req.socket.remoteAddress;
  const userAgent = req.get("User-Agent") ?? "NOT_FOUND";

  if (!req.cookies["token"]) {
    console.log("no cookies found");
    res.status(401).json({ message: "Access expired" });
    return;
  }
  token = req.cookies["token"] as string;

  try {
    const payload = verifyToken(token, process.env.ENV_SECRET as string);
    if (!payload) {
      res.status(401).json({ message: "Not authorized to access" });
      return;
    }

    if (payload.ipAddress !== ipAddress || payload.userAgent != userAgent) {
      res.clearCookie("token").json({ message: "Not authorized to acces " });
      return;
    }
    // inject pw hash here
    const db = getDb();
    const account = await AccountDB.fetchUser(db, payload.username);

    assert(account != null, "account should not be null");
    assert(
      account!.username === payload.username,
      "account and payload username should be the same"
    );

    // check if user is active state
    if (account.accountStatus !== "active") {
      console.log("account status is disabled, cannot continue");
      res.status(401).json({
        message: "Not authorized to access",
      });
      return;
    }

    const isAdmin = await Checkgroup(account.username, "ADMIN");

    if (payload.isAdmin != isAdmin) {
      console.log("Refresh token");
      const newPayload = { ...payload, isAdmin };
      token = generateToken({
        secret: process.env.ENV_SECRET as string,
        jwtPayload: newPayload,
        expiresIn: process.env.TOKEN_EXPIRY ?? "1d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 5, // 5 hours for now
      });
    }
    next();
  } catch (error) {
    console.error(`failed to validate cookie: ${error}`);
    res
      .status(500)
      .json({ message: "failed to authenticated. please contact your admin" });
  }
};

/**
 * if `groups` is empty, then no need to check
 * @param checkGroups
 * @param secret
 * @returns
 */
export const authorizedGroups =
  (checkGroups: string[], secret: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    assert(req.cookies["token"], "cookie must exists");
    if (req.cookies.token == null) {
      res.status(401).json({ message: "Unauthorized to access routes" });
      return;
    }
    const payload = verifyToken(req.cookies.token, secret);
    if (!payload) {
      res.status(401).json({ message: "Unauthorized to access routes" });
      return;
    }

    if (0 == checkGroups.length) {
      next();
      return;
    }

    const username = payload.username;
    const db = getDb();

    const g = await fetchByUsername(db, username);
    if (g.length == 0) {
      res.status(401).json({ message: "Unauthorized to access routes" });
      return;
    }
    const currentGroups = g.map((e) => e.user_group);
    const checkGroupSet = new Set(checkGroups);

    // current groups in at least one checkGroups
    const filteredGroups = currentGroups.filter((e) => checkGroupSet.has(e));
    if (filteredGroups.length == 0) return;
    next();
  };
