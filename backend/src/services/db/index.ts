import mysql from "mysql2/promise";
var connection: mysql.Connection | null;

const createConnection = ({
  host,
  username,
  password,
  database,
}: {
  host: string;
  username: string;
  password: string;
  database: string;
}) => {
  try {
    connection = mysql.createPool({
      connectionLimit: 100,
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
export * as TMSDB from "./tms";
export * as UserGroupDB from "./user_group";
