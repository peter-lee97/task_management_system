import { Connection, ResultSetHeader } from "mysql2/promise";
import { Account } from "../../../model";

export const fetchUser = async (
  db: Connection,
  username: string
): Promise<Account | null> => {
  const sql = "SELECT * FROM accounts WHERE username = ? LIMIT 1";
  const values = [username];
  try {
    const [result] = await db.execute<Account[]>(sql, values);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    throw error;
  }
};

export const fetchAllUsers = async (db: Connection): Promise<Account[]> => {
  const sql = "SELECT * FROM accounts ORDER BY username";
  try {
    const [result] = await db.query<Account[]>(sql);
    return result;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (
  db: Connection,
  account: Account
): Promise<Account | null> => {
  const sql =
    "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)";
  const values = [account.username, account.password, account.email ?? null];
  try {
    const [inserted] = await db.execute<ResultSetHeader>(sql, values);
    if (inserted.affectedRows == 0) return null;
  } catch (error) {
    console.error(error);
    throw error;
  }

  return fetchUser(db, account.username);
};

export const updateUser = async (
  db: Connection,
  account: Account
): Promise<Account | null> => {
  try {
    const sql =
      "UPDATE `accounts` SET email = ? , password = ?, accountStatus = ? WHERE username = ? LIMIT 1";
    const values = [
      account.email ?? null,
      account.password,
      account.accountStatus,
      account.username,
    ];
    const [inserted] = await db.execute<ResultSetHeader>(sql, values);
    if (inserted.affectedRows == 0) return null;
    return fetchUser(db, account.username);
  } catch (error) {
    throw error;
  }
};
