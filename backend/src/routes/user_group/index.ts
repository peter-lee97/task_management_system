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

router.get("/fetchGroups", fetchGroups);
router.post("/fetchUserGroups", fetchUserGroups);
router.post("/addToGroup", [authorizedGroups(["ADMIN"]), addUserToGroup]);
router.post("/removeFromGroup", [
  authorizedGroups(["ADMIN"]),
  removeUserFromGroup,
]);

export default router;
