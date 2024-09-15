export { Account } from "./account";
export { Application } from "./application";
export { Plan } from "./plan";
export { Task } from "./task";
export { UserGroup } from "./user_group";

export interface AccountPayload {
  username: string;
  isAdmin: boolean;
  ipAddress: string | undefined;
  userAgent: string | undefined;
}

declare module "express-serve-static-core" {
  interface Request {
    accountPayload?: AccountPayload;
  }
}
