import { Request, Response } from "express";
import { getDb, UserGroupDB } from "../../services/db";
import { verifyToken } from "../../services/jwt";

// Use fetch all usergroup rows with username
export const fetchUserGroups = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }
  const payload = verifyToken(token, process.env.ENV_SECRET as string);
  if (!payload) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }
  const db = getDb();
  const { username } = req.body;
  if (!username) {
    res.status(400).send({ message: "username field not found" });
    return;
  }

  if (
    !(await UserGroupDB.Checkgroup(payload.username, "admin")) &&
    username != payload.username
  ) {
    res.status(403).json({ message: "Unauthorized to access resource" });
    return;
  }

  try {
    const usergroups = await UserGroupDB.fetchByUsername(
      db,
      username as string
    );
    res.status(200).send({
      message: "success",
      result: usergroups,
    });
    return;
  } catch (error) {
    console.error(`failed to query fetchUserGroup: ${error}`);
    res.status(400).send({ message: "Failed to fetch user groups" });
  }
};

/**
 * fetch available groups in string[]
 * @param req
 * @param res
 */
export const fetchGroups = async (req: Request, res: Response) => {
  console.log("[fetchGroup]");
  const db = getDb();
  try {
    const [result] = await db.query(
      "SELECT DISTINCT user_group FROM usergroup ORDER BY user_group;"
    );

    const groups = Object.entries(result).map(
      ([_, value]) => value["user_group"] as string
    );

    res.status(200).json({ result: groups, message: "success" });
  } catch (error) {
    res.status(400).json({ message: "failed to fetch groups" });
  }
};

export const removeUserFromGroup = async (req: Request, res: Response) => {
  console.log("[removeUserFromGroup]");

  const { username, usergroup } = req.body;

  if (!username || !usergroup) {
    res.status(400).send({ message: "username and usergroup fields required" });
    return;
  }
  const db = getDb();
  const inGroup = await UserGroupDB.Checkgroup(username, usergroup);
  if (!inGroup) {
    console.log(`nothing to remove in user group`);
    return res.status(200).send({ message: "success" });
  }

  if (username == "admin" && usergroup === "ADMIN") {
    console.log("should not remove admin from ADMIN");
    return res
      .status(400)
      .send({ message: "hardcoded admin cannot be removed" });
  }

  await UserGroupDB.removeFromGroup(db, username, usergroup);
  res.status(200).send({ message: "update successful" });
};

export const addUserToGroup = async (req: Request, res: Response) => {
  const db = getDb();
  let { username, usergroup } = req.body;
  if (!username) username = "";
  if (!usergroup) {
    res.status(400).send({ message: "user group field is required" });
    return;
  }

  const groupExists = await UserGroupDB.Checkgroup("", usergroup);
  if (!groupExists) {
    res.status(400).json({ message: `${usergroup} group do not exists.` });
    return;
  }

  try {
    const inGroup = await UserGroupDB.Checkgroup(username, usergroup);
    if (inGroup) {
      res.status(400).send({ message: "Entry already exists" });
      return;
    }

    await UserGroupDB.addToGroup(db, username, usergroup);
    const group = await UserGroupDB.fetchByGroupAndUsername(
      db,
      username,
      usergroup
    );
    res.status(200).send({ message: "success", result: group });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      res.status(400).send({ message: error.message });
      return;
    }
    res.status(400).send({ message: "failed to create usergroup" });
  }
};
