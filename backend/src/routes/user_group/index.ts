import express from "express";
import {
  addUserToGroup,
  fetchGroups,
  fetchUserGroups,
  removeUserFromGroup,
} from "../../controllers/user_group";
import { adminOnly, validateCookie } from "../../middleware/auth";

const router = express.Router();

router.get("/", [validateCookie, fetchUserGroups]);
router.get("/groups", [validateCookie, fetchGroups]);
router.delete("/remove", [validateCookie, adminOnly, removeUserFromGroup]);
router.post("/create", [validateCookie, adminOnly, addUserToGroup]);

export default router;
