import { NextFunction, Request, Response } from "express";
import assert from "node:assert";
import { AccountDB, getDb, UserGroupDB } from "../../services/db";
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
    res.status(401).json({ message: "Access expired. Please login again." });
    return;
  }
  token = req.cookies["token"] as string;

  try {
    const payload = verifyToken(token, process.env.ENV_SECRET as string);
    if (!payload) {
      res.status(401).json({ message: "Unauthorized to access route" });
      return;
    }

    if (payload.ipAddress !== ipAddress || payload.userAgent != userAgent) {
      res
        .clearCookie("token")
        .json({ message: "Unauthorized to access route" });
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
        message: "Unauthorized to access route",
      });
      return;
    }

    const isAdmin = await UserGroupDB.Checkgroup(account.username, "ADMIN");

    if (isAdmin) {
      const newPayload = { ...payload };
      token = generateToken({
        secret: process.env.ENV_SECRET as string,
        jwtPayload: newPayload,
        expiresIn: process.env.TOKEN_EXPIRY ?? "1d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * parseInt(process.env.COOKIE_EXPIRY as string), // 5 hours for now
      });
      console.log("added refreshed coookie");
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
 * `groups` length is empty, as not authorized
 * @param checkGroups
 * @param secret
 * @returns
 */
export const authorizedGroups =
  (checkGroups: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("[authorizedGroups]");
    assert(checkGroups.length > 0, "check groups contain at least 1 value");
    assert(req.cookies["token"], "cookie must exists");

    if (req.cookies.token == null) {
      console.log("cookie token not found");
      res.status(401).json({ message: "Unauthorized to access route" });
      return;
    }
    const payload = verifyToken(
      req.cookies.token,
      process.env.ENV_SECRET as string
    );
    if (!payload) {
      res.status(401).json({ message: "Unauthorized to access route" });
      return;
    }

    if (0 == checkGroups.length) {
      res.status(403).json({ message: "Unauthorized to access resource" });
      return;
    }

    const username = payload.username;

    let isValue = false;

    for await (const g of new Set(checkGroups)) {
      isValue = await UserGroupDB.Checkgroup(username, g);
      if (isValue) break;
    }

    if (!isValue) {
      res.status(401).json({ message: "Unauthorized to access route" });
      return;
    }
    next();
  };
