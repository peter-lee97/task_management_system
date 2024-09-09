import mysql from "mysql2/promise";
var connection: mysql.Connection | null;

const createConnection = async ({
  host,
  username,
  password,
  database,
}: {
  host: string;
  username: string;
  password: string;
  database: string;
}): Promise<void> => {
  try {
    connection = await mysql.createConnection({
      host,
      user: username,
      password,
      database,
    });
  } catch (error) {
    console.error(`failed to establish connection: ${error}`);
    throw Error(`Failed to establish connection`);
  }
};

export function getDb(): mysql.Connection {
  if (!connection) throw "Database connection not yet established";
  return connection;
}

export default createConnection;

export * as AccountDB from "./account";
export * as UserGroupDB from "./user_group";
