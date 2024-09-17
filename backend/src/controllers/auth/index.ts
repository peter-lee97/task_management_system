import { NextFunction, Request, Response } from "express";

import { Account } from "../../model";
import { AccountDB, getDb } from "../../services/db";
import { Checkgroup } from "../../services/db/user_group";
import { compareHash, generateToken, hashPassword } from "../../services/jwt";

export async function login(req: Request, res: Response): Promise<void> {
  console.log(`[login]`);
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
      console.log("cannot find account");
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (account.accountStatus !== "active") {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isAdmin = await Checkgroup(account.username, "ADMIN");

    if (!(await compareHash(password, account.password))) {
      res.status(400).send({ message: "Invalid credentials" });
      return;
    }

    const ipAddress = req.socket.remoteAddress;
    const userAgent = req.get("User-Agent") ?? "NOT_FOUND";
    const jwtPayload = {
      ipAddress,
      isAdmin,
      userAgent,
      username: account.username,
    };
    const token = generateToken({
      secret: process.env.ENV_SECRET as string,
      jwtPayload,
      expiresIn: process.env.EXPIRES_IN ?? "1d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 5, // 5 hours for now
      })
      .status(200)
      .json({ message: "success", result: account });
    return;
  } catch (error) {
    console.error(`failed to query for login: ${error}`);
    res.status(500).send({ message: "Failed to fetch value" });
  }
}

export const logout = async (req: Request, res: Response) => {
  console.log("[logout]");
  return res
    .clearCookie("token")
    .status(200)
    .send({ message: "Signed out successfully" });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[register]");
  const { username, password, email, accountStatus } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Username and Password fields cannot be empty" });
  }

  const db = getDb();

  const result = await AccountDB.fetchUser(db, username);
  if (result != null) {
    return res.status(400).json({ message: "username already exists" });
  }

  try {
    const templateAccount = {
      accountStatus: accountStatus ?? "active",
      password: await hashPassword(password),
      username: username as string,
      ...(email ? { email } : null),
    } as Account;

    const newAccount = await AccountDB.createUser(db, templateAccount);

    if (!newAccount) {
      res.status(400).send({
        message: "failed to create an account. please contact your admin",
      });
      return;
    }

    return res.status(200).json({
      message: "success",
      result: newAccount,
    });
  } catch (error) {
    console.error(`failed to query for login: ${error}`);
    res
      .status(500)
      .send({ message: "failed to create an account. please contact dev" });
  }
};

export const updateCredentials = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("[update credentials]");
  const payload = req.accountPayload;
  // sanity check
  if (!payload) {
    res.status(500).json({ message: "failed internal check" });
    return;
  }
  const username = req.query["username"] as string | null;
  if (!username) {
    res.status(400).json({ message: "missing username query param" });
    return;
  }
  const { accountStatus, email, password } = req.body;

  if (payload.username !== username && !payload.isAdmin) {
    res.status(401).json({ message: "User not authorized" });
    return;
  }

  if (!payload.isAdmin && accountStatus) {
    console.log("non admin trying to change account status");
    res.status(401).json({ message: "User not authorized" });
    return;
  }

  const db = getDb();
  const accountFromDb = await AccountDB.fetchUser(db, username);

  if (accountFromDb == null) {
    res.status(400).json({
      message: "Account not found",
    });
    return;
  }

  const copyAccount = Object.assign({}, accountFromDb);

  if (password) {
    const isSame = await compareHash(password, accountFromDb.password);
    if (!isSame) {
      copyAccount.password = await hashPassword(password);
      console.log(`hash password: ${copyAccount["password"]}`);
    }
  }

  if (email != null) copyAccount.email = email;
  if (accountStatus != null && username !== "admin") {
    copyAccount.accountStatus = accountStatus;
  }

  try {
    const updatedAccount = await AccountDB.updateUser(db, copyAccount);
    res.status(200).send({ message: "success", result: updatedAccount });
    return;
  } catch (error) {
    console.error("failed to update user");
    res.status(500).json({ message: "failed to update user" });
  }
};

export const fetchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDb();

  if (req.query["username"] != null) {
    console.log("[fetch user]:", req.query["username"]);
    const username = req.query["username"] as string;
    const account = await AccountDB.fetchUser(db, username);
    res.status(200).send({ message: "success", result: account });
    return;
  }
  console.log("[fetchUsers]");
  const accounts = await AccountDB.fetchAllUsers(db);
  console.log(`accounts: ${accounts.length}`);
  res.status(200).send({ message: "success", result: accounts });
  return;
};
