import express from "express";
import {
  addUserToGroup,
  fetchGroups,
  fetchUserGroups,
  removeUserFromGroup,
} from "../../controllers/user_group";
import { authorizedGroups, validateCookie } from "../../middleware/auth";

const router = express.Router();

router.use(validateCookie);

router.get("/groups", fetchGroups);
router.get("/", fetchUserGroups);
router.post("/", [authorizedGroups(["ADMIN"]), addUserToGroup]);
router.delete("/", [authorizedGroups(["ADMIN"]), removeUserFromGroup]);

export default router;
