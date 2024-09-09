import express from "express";
import { addUserToGroup, fetchUserGroups } from "../../controllers/user_group";
import { adminOnly, validateToken } from "../../middleware/auth";

const router = express.Router();

router.get("/", [validateToken, adminOnly, fetchUserGroups]);
router.post("/create", [validateToken, adminOnly, addUserToGroup]);

export default router;
