import express from "express";
import {
  adminResetAccount,
  adminUpdateCredentials,
  login,
  logout,
  register,
  updateCredentials,
  updatePassword,
  view,
} from "../../controllers/auth";
import { validateToken } from "../../middleware";
import { adminOnly, validateActive } from "../../middleware/auth";

const router = express.Router();

router.get("/", [view]);
router.post("/login", [login]);
router.post("/register", [validateToken, validateActive, register]);
router.post("/logout", [logout]);
// udpate infomation like credentials
router.put("/update", [validateToken, validateActive, updateCredentials]);
router.patch("/password", [validateToken, validateActive, updatePassword]);

// admin priviledge
router.use("/admin", [validateToken, adminOnly]);
router.patch("/admin/update", adminUpdateCredentials);
router.post("/admin/reset", adminResetAccount);

export default router;
