import { NextFunction, Request, Response } from "express";

import assert from "node:assert";
import { Account } from "../../model";
import { AccountDB, getDb, UserGroupDB } from "../../services/db";
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
      console.log(`account not found: ${username}`);
      res.status(400).json({ message: "Account not found" });
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

    // const hashPW = await hashPassword(password, 2);
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
      .json({ message: "success", results: account, jwt: token });
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

  try {
    const templateAccount = {
      accountStatus: accountStatus ?? "active",
      password: await hashPassword(password, 2),
      username: username as string,
      ...(email ? { email } : null),
    } as Account;

    const newAccount = await AccountDB.createUser(db, templateAccount);

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
  const fetchAccount = await AccountDB.fetchUser(db, username);

  if (fetchAccount == null) {
    res.status(400).json({
      message: "Account not found",
    });
    return;
  }
  const copyAccount = { ...fetchAccount };

  if (password) {
    const isSame = await compareHash(password, fetchAccount.password);
    if (!isSame) {
      copyAccount["password"] = await hashPassword(password, 2);
      console.log(`hash password: ${copyAccount["password"]}`);
    }
  }

  copyAccount["email"] = email;

  try {
    const updatedAccount = await AccountDB.updateUser(db, copyAccount);
    res.status(200).send({ message: "success", result: updatedAccount });
    return;
  } catch (error) {
    console.error("failed to update user");
    res.status(500).json({ message: "failed to update user" });
  }
};

// [Deprecated]
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).send({ message: "Password field required" });
  }
  const db = getDb();

  const accountPayload = req.accountPayload;

  if (!accountPayload) {
    res.status(500).json({ message: "failed internal check" });
    return;
  }
  const fetchAccount = await AccountDB.fetchUser(db, accountPayload.username);

  if (fetchAccount == null)
    return res.status(400).send({ message: "Account not found" });

  const newAccount = await AccountDB.updateUser(db, {
    ...fetchAccount,
    password: await hashPassword(password, 2),
  });

  return res.status(200).send({ message: newAccount }).end();
};

export const fetchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDb();

  if (req.query["username"] != null) {
    console.log("[user]:", req.query["username"]);
    const username = req.query["username"] as string;
    const account = await AccountDB.fetchUser(db, username);
    res.status(200).send({ message: "success", result: account });
    return;
  }
  console.log("[users]");
  const account = await AccountDB.fetchAllUsers(db);
  res.status(200).send({ message: "success", result: account });
  return;
};

// Deprecated
export const adminUpdateCredentials = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("[adminUpdateCredentials]");
  const { accountStatus, email, username, password } = req.body;
  if (!username) {
    res.status(400).json({ message: "username required to update" });
    return;
  }
  if (!accountStatus && !email && !password) {
    res.status(200).json({ message: "nothing updated" });
    return;
  }

  const db = getDb();
  const account = await AccountDB.fetchUser(db, username);
  assert(account != null, "account should not be null");

  // TODO: prevent other ppl to change `ADMIN` information
  if (username === "admin") {
    res
      .status(401)
      .json({ message: "unable to make changes, please contact admin" });
    return;
  }
  const updatedAccount = await AccountDB.updateUser(db, {
    ...account,
    ...(email ? { email } : null),
    accountStatus: accountStatus ?? account.accountStatus,
    password: await hashPassword(password, 2),
  });

  res
    .status(200)
    .json({ message: "successfully update", result: updatedAccount });
  return;
};

/// deprecated
export const adminResetAccount = async (
  req: Request,
  res: Response
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

export const deleteUser = async (req: Request, res: Response) => {
  if (req.query[""]) {
    // TODO:
  }
};
