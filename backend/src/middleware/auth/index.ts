import { NextFunction, Request, Response } from "express";
import assert from "node:assert";
import { AccountDB, getDb } from "../../services/db";
import { Checkgroup } from "../../services/db/user_group";
import { generateToken, verifyToken } from "../../services/jwt";

/**
 * Validate via cookie.
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
      generateToken({
        secret: process.env.ENV_SECRET as string,
        jwtPayload: newPayload,
        expiresIn: process.env.EXPIRES_IN ?? "1d",
      });
      req.accountPayload = newPayload;
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 5, // 5 hours for now
      });
    } else {
      req.accountPayload = { ...payload };
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
 * `validateCookie()` must be called before calling this
 *
 * req.accountPayload must exists
 * @param req
 * @param res
 * @param next
 */
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  assert(
    req.accountPayload,
    "accountPayload must be exists, check if validateCookie is called first"
  );
  if (!req.accountPayload) {
    res.status(401).json({ message: "Not authorized to access" });
    return;
  }
  const accountPayload = req.accountPayload!;

  accountPayload.isAdmin
    ? next()
    : res.status(401).json({ message: "Not authorized to access" });
  return;
};
