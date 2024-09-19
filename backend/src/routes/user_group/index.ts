import express from "express";
import {
  addUserToGroup,
  fetchGroups,
  fetchUserGroups,
  removeUserFromGroup,
} from "../../controllers/user_group";
import { authorizedGroups, validateCookie } from "../../middleware/auth";

const router = express.Router();
const secret = process.env.ENV_SECRET as string;

router.get("/", [validateCookie, fetchUserGroups]);
router.get("/groups", [validateCookie, fetchGroups]);
router.delete("/remove", [
  validateCookie,
  authorizedGroups(["ADMIN"], secret),
  removeUserFromGroup,
]);
router.post("/create", [
  validateCookie,
  authorizedGroups(["ADMIN"], secret),
  addUserToGroup,
]);

export default router;
