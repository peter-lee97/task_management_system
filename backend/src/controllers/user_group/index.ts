import { Request, Response } from "express";
import { getDb, UserGroupDB } from "../../services/db";
import {
  addToGroup,
  Checkgroup,
  fetchByGroupAndUsername,
  removeFromGroup,
} from "../../services/db/user_group";

// Use fetch all usergroup rows with username
export const fetchUserGroups = async (req: Request, res: Response) => {
  const db = getDb();
  const { username } = req.query;
  if (!username) {
    res.status(400).send({ message: "Username query params cannot be empty" });
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

export const fetchGroups = async (req: Request, res: Response) => {
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
  const username = req.query["username"] as string;
  const usergroup = req.query["usergroup"] as string;

  // const { usergroups } = req.body;

  if (!username || !usergroup) {
    res.status(400).send({ message: "username and usergroup fields required" });
    return;
  }
  const db = getDb();
  const inGroup = await Checkgroup(username, usergroup);
  if (!inGroup) {
    return res.status(200).send({ message: "successfully updated" });
  }

  if (
    username == "admin" &&
    req.accountPayload?.isAdmin &&
    usergroup === "ADMIN"
  ) {
    console.log("should not remove admin from ADMIN");
    return res.status(200).send({ message: "successfully updated" });
  }

  await removeFromGroup(db, username, usergroup);
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

  try {
    const inGroup = await Checkgroup(username, usergroup);
    console.log(`is group exists: ${inGroup} | ${username} | ${usergroup}`);

    if (inGroup) {
      res.status(400).send({ message: "Entry already exists" });
      return;
    }

    await addToGroup(db, username, usergroup);
    const group = await fetchByGroupAndUsername(db, username, usergroup);
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
