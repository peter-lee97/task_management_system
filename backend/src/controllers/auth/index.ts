import { NextFunction, Request, Response } from "express";

import assert from "node:assert";
import { Account } from "../../model";
import { AccountDB, getDb, UserGroupDB } from "../../services/db";
import { compareHash, generateToken, hashPassword } from "../../services/jwt";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .send({ message: "Username and Password fields are required to login" });
    return;
  }

  const db = getDb();

  try {
    const account = await AccountDB.fetchUser(db, username);
    if (!account) {
      res.status(400).send({ message: "Account not found" });
      return;
    }

    if (account.accountStatus !== "active") {
      res
        .status(401)
        .json({ message: "Not authorized to access route, account disabled" });
      return;
    }

    let isAdmin = await UserGroupDB.Checkgroup(db, account.username, "ADMIN");
    // Check if user is from other admin group
    if (!isAdmin) {
      const groups = await UserGroupDB.fetchByUsername(db, account.username);
      const filter = groups.filter((value) =>
        value.user_group.toLowerCase().includes("admin")
      );
      isAdmin = filter.length > 0;
    }

    if (
      username != "admin" &&
      !(await compareHash(password, account.password))
    ) {
      res.status(400).send({ message: "Invalid Credentials" });
      return;
    }

    if (username === "admin" && password != account.password) {
      console.log("Checking for root admin");
      res.status(400).send({ message: "Invalid Credentials" });
      return;
    }

    const hashPW = await hashPassword(password, 2);
    const ipAddress = req.socket.remoteAddress;
    const userAgent = req.get("User-Agent") ?? "NOT_FOUND";
    const jwtPayload = {
      ipAddress,
      isAdmin,
      userAgent,
      username: account.username,
      passwordHash: hashPW,
    };
    const token = generateToken({
      secret: process.env.ENV_SECRET as string,
      jwtPayload,
      expiresIn: process.env.EXPIRES_IN ?? "1d",
    });
    res
      .setHeader("Authorization", `Bearer ${token}`)
      .status(200)
      .json({ message: "success", results: account, jwt: token });
    return;
  } catch (error) {
    console.error(`failed to query for login: ${error}`);
    next(error);
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Logout failed" });
    }
    return res.status(200).send({ message: "Signed out successfully" }).end();
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Username and Password fields cannot be empty" });
  }

  const db = getDb();

  try {
    const preCreateAccount = {
      accountStatus: "active",
      email: email as string,
      password: await hashPassword(password, 2),
      username: username as string,
    } as Account;
    const newAccount = await AccountDB.createUser(db, preCreateAccount);

    if (!newAccount) {
      res.status(400).send({ message: "Failed to create an account" });
      return;
    }

    return res.status(200).json({
      message: "success",
      result: newAccount,
    });
  } catch (error) {
    console.error(`failed to query for login: ${error}`);
    res.status(400).send({ message: "Failed to create an account" });
  }
};

export const updateCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const payload = req.accountPayload;
  // sanity check
  if (!payload) {
    res.status(500).json({ message: "failed internal check" });
    return;
  }
  const { email } = req.body;
  if (!email) {
    console.log("no fields updated");
    res.status(200).send({ message: "success" });
    return;
  }
  const db = getDb();
  const fetchAccount = await AccountDB.fetchUser(db, payload.username);

  if (fetchAccount == null) {
    res.status(400).send({
      message: "Account not found",
    });
    return;
  }

  try {
    const updatedAccount = await AccountDB.updateUser(db, {
      ...fetchAccount,
      email: email || fetchAccount.email,
    });
    res.status(200).send({ message: "success", result: updatedAccount });
    return;
  } catch (error) {
    console.error("failed to update user");
    res.status(500).json({ message: "failed to update user" });
  }
  next();
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body;
  if (!password) {
    return res
      .status(400)
      .send({ message: "Username and Password fields required" });
  }
  const db = getDb();

  const accountPayload = req.accountPayload;

  if (!accountPayload) {
    res.status(500).json({ message: "failed internal check" });
    return;
  }
  const fetchAccount = await AccountDB.fetchUser(db, accountPayload.username);

  if (
    fetchAccount == null ||
    fetchAccount.password !== accountPayload.passwordHash
  )
    return res.status(400).send({ message: "Account not found" });

  const newAccount = await AccountDB.updateUser(db, {
    ...fetchAccount,
    password: await hashPassword(password, 2),
  });

  return res.status(200).send({ message: newAccount }).end();
};

export const view = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const username = req.query["username"] as string;
  console.log(`[view] username: ${username}`);
  if (!username) {
    res.status(400).json({ message: "username not found" });
    return;
  }
  const db = getDb();
  const account = await AccountDB.fetchUser(db, username);
  res.status(200).send({ message: "success", result: account });
  return;
};

export const adminUpdateCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("[adminUpdateCredentials]");
  const { accountStatus, email, username } = req.body;
  if (!username) {
    res.status(400).json({ message: "username required to update" });
    return;
  }
  if (!accountStatus && !email) {
    res.status(200).json({ message: "nothing updated" });
    return;
  }

  const db = getDb();
  const account = await AccountDB.fetchUser(db, username);
  assert(account != null, "account should not be null");

  console.log(`req body: ${accountStatus} | ${email} | ${username}`);

  const updatedAccount = await AccountDB.updateUser(db, {
    ...account,
    accountStatus: accountStatus ?? account.accountStatus,
    email: email ?? account.email,
  });

  res
    .status(200)
    .json({ message: "successfully update", result: updatedAccount });
  return;
};

export const adminResetAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("[adminResetAccount]");
  const username = req.query["username"] as string;
  if (!username) {
    res.status(400).json({ message: "username cannot be empty" });
    return;
  }
  const db = getDb();
  const userAccount = await AccountDB.fetchUser(db, username);

  if (!userAccount) {
    res.status(400).json({ message: "Account not found" });
    return;
  }

  const updateAccount = await AccountDB.updateUser(db, {
    ...userAccount!,
    email: null,
    accountStatus: "active",
    password: await hashPassword("test", 2),
  });

  res
    .status(200)
    .send({ message: "update successfully", result: updateAccount });

  return;
};
