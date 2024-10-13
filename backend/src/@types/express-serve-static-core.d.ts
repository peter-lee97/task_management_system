import { AccountPayload } from "../model";
declare module "express-serve-static-core" {
  interface Request {
    accountPayload?: AccountPayload;
  }
}
