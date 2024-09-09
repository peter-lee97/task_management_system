import { NextFunction, Request, Response } from "express";
import { getDb, UserGroupDB } from "../../services/db";
import {
  addToGroup,
  fetchByGroupAndUsername,
} from "../../services/db/user_group";

// Use fetch all usergroup rows with username
export const fetchUserGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const db = getDb();
  const { username } = req.query;
  if (!username) {
    res.status(400).send({ message: "Username field cannot be empty" });
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

export const addUserToGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const db = getDb();
  const { username, usergroup } = req.body;
  if (!usergroup || !username) {
    res
      .status(400)
      .send({ message: "UserGroup and Username fields cannot be empty" });
    return;
  }

  try {
    let group = await fetchByGroupAndUsername(db, username ?? "", usergroup);
    if (group) {
      res.status(400).send({ message: "entry already exists" }).end();
      return;
    }
    await addToGroup(db, username ?? "", usergroup);
    group = await fetchByGroupAndUsername(db, username, usergroup);
    res.status(200).send({ message: "success", result: group }).end();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      res.status(400).send({ message: error.message });
      return;
    }
    res.status(400).send({ message: "failed to create usergroup" });
  }
};
