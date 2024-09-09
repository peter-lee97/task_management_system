import { Connection, ResultSetHeader } from "mysql2/promise";
import { UserGroup } from "../../../model";

// Search user group by username
export const fetchByUsername = async (
  db: Connection,
  username: string
): Promise<UserGroup[]> => {
  try {
    const [result] = await db.query<UserGroup[]>(
      `
        SELECT *
        FROM UserGroup
        WHERE username = '${username}'
        ORDER BY username
        `
    );
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchByGroupName = async (
  db: Connection,
  groupname: string
): Promise<UserGroup[]> => {
  const sql = "SELECT * FROM UserGroup WHERE user_group = ?";
  const values = [groupname];

  try {
    const [result] = await db.query<UserGroup[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchByGroupAndUsername = async (
  db: Connection,
  username: string,
  groupname: string
): Promise<UserGroup | null> => {
  const sql =
    "SELECT * FROM UserGroup WHERE user_group = ? AND username = ? LIMIT 1";
  const values = [groupname, username];
  try {
    const [result] = await db.query<UserGroup[]>(sql, values);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    throw error;
  }
};

export const addToGroup = async (
  db: Connection,
  username: string,
  usergroup: string
): Promise<void> => {
  const sql = `
    INSERT INTO UserGroup (username, user_group)
    VALUES (?, ?)
  `;

  const values = [username, usergroup];
  try {
    const [result] = await db.execute<ResultSetHeader>(sql, values);
    console.log(
      `new entry ${result.affectedRows} in user group: ${username} | ${usergroup}`
    );
  } catch (error) {
    throw error;
  }
};

export const Checkgroup = async (
  db: Connection,
  username: string,
  groupname: string
): Promise<boolean> => {
  const sql =
    "SELECT * FROM UserGroup WHERE username = ? AND user_group = ? ORDER BY username, user_group";
  const values = [username, groupname];
  try {
    const [result] = await db.query<UserGroup[]>(sql, values);
    return result.length != 0;
  } catch (error) {
    throw error;
  }
};
