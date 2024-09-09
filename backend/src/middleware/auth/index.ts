import { NextFunction, Request, Response } from "express";
import assert from "node:assert";
import { AccountDB, getDb } from "../../services/db";
import { verifyToken } from "../../services/jwt";

/**
 * Valid Token with `ENV_SECRET`
 * Pass token payload to `req.accountPayload`
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("[validateToken]");
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(Error("Not authorized to access route"));

  try {
    const payload = verifyToken(token, process.env.ENV_SECRET as string);
    if (!payload) {
      next(Error("Not authorized to access route"));
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
    req.accountPayload = { ...payload, passwordHash: account.password };
    next();
  } catch (error) {
    return next(error);
  }
};

/**
 * `validateToken` must be called before this middleware
 * check `isAdmin` from payload
 * @param req
 * @param res
 * @param next
 */
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("[adminOnly]");
  if (!req.accountPayload) throw "Unhandled error. token is invalid";
  const accountPayload = req.accountPayload!;
  console.log(
    `account name: ${accountPayload.username} | isAdmin: ${accountPayload.isAdmin}`
  );
  accountPayload.isAdmin
    ? next()
    : res.status(401).json({ message: "Not authorized to access route" });
};

export const validateActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const account = req.accountPayload;
  const db = getDb();
  const fetchAccount = await AccountDB.fetchUser(db, account!.username);
  if (fetchAccount?.accountStatus.toLowerCase() === "active") {
    next();
    return;
  }
  console.log(`user is disabled`);
  res.status(404).send({ message: "Not authorized to access route" });
};
