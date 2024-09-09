import { RowDataPacket } from "mysql2/promise";

export interface UserGroup extends RowDataPacket {
  username: string;
  user_group: string;
}
