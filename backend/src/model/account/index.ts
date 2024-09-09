import { RowDataPacket } from "mysql2";

export interface Account extends RowDataPacket {
  username: string;
  password: string;
  email: string | null;
  accountStatus: string;
}
