import { Connection, ResultSetHeader } from "mysql2/promise";
import { getDb } from "..";
import { UserGroup } from "../../../model";

// Search user group by username
export const fetchByUsername = async (
  db: Connection,
  username: string
): Promise<UserGroup[]> => {
  const sql = "SELECT * FROM UserGroup WHERE username = ? ORDER BY username";
  const values = [username];
  try {
    const [result] = await db.execute<UserGroup[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchByGroupname = async (
  db: Connection,
  groupname: string
): Promise<UserGroup[]> => {
  const sql = "SELECT * FROM UserGroup WHERE user_group = ?";
  const values = [groupname];

  try {
    const [result] = await db.execute<UserGroup[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchByGroupAndUsername = async (
  db: Connection,
  username: string | undefined,
  groupname: string
): Promise<UserGroup | null> => {
  if (username == undefined) username = "";
  const sql =
    "SELECT * FROM UserGroup WHERE user_group = ? AND username = ? LIMIT 1";
  const values = [groupname, username];
  try {
    const [result] = await db.execute<UserGroup[]>(sql, values);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    throw error;
  }
};

export const addToGroup = async (
  db: Connection,
  username: string | undefined,
  usergroup: string
): Promise<void> => {
  const sql = `
    INSERT INTO UserGroup (username, user_group)
    VALUES (?, ?)
  `;

  if (username == undefined) username = "";

  const values = [username, usergroup];
  try {
    const [result] = await db.execute<ResultSetHeader>(sql, values);
  } catch (error) {
    throw error;
  }
};

export const removeFromGroup = async (
  db: Connection,
  username: string | undefined,
  usergroup: string
): Promise<void> => {
  const sql = "DELETE FROM UserGroup WHERE username = ? AND user_group = ?";
  const values = [username, usergroup];
  try {
    const [result] = await db.execute<ResultSetHeader>(sql, values);
    console.log(`remove ${username} from ${usergroup}`);
    console.log(`new entry ${result} in user group: ${username}|${usergroup}`);
  } catch (error) {
    throw error;
  }
};

export const isUserAdmin = async (
  db: Connection,
  username: string
): Promise<boolean> => {
  const sql = `
  SELECT exists(
	  SELECT 1 from UserGroup WHERE username = ? AND user_group LIKE ? LIMIT 1
  );
  `;
  const values = [username, "%admin%"];
  try {
    const [result] = await db.execute<UserGroup[]>(sql, values);
    if (result.length == 0) return false;
    if (Object.values(result[0])[0] == 1) return true;
  } catch (error) {
    throw error;
  }

  return false;
};

export const Checkgroup = async (
  username: string,
  groupname: string
): Promise<boolean> => {
  const db = getDb();
  const sql =
    "SELECT * FROM UserGroup WHERE username = ? AND user_group = ? ORDER BY username, user_group";
  const values = [username, groupname];
  try {
    const [result] = await db.execute<UserGroup[]>(sql, values);
    return result.length != 0;
  } catch (error) {
    throw error;
  }
};
