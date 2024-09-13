import express from "express";
import {
  fetchUsers,
  login,
  logout,
  register,
  updateCredentials,
} from "../../controllers/auth";
import {
  adminOnly,
  validateActive,
  validateCookie,
} from "../../middleware/auth";
import { getDb } from "../../services/db";
import { fetchUser } from "../../services/db/account";
import { verifyToken } from "../../services/jwt";

const router = express.Router();

router.get("/validate", async (req, res) => {
  if (!req.cookies["token"]) {
    res.status(401).json({ message: "User not authenticated, please login" });
    return;
  }
  const cookietoken = req.cookies["token"];
  const payload = verifyToken(cookietoken, process.env.ENV_SECRET as string);
  if (!payload) {
    res.status(401).json({ message: "invalid token, please login" });
    return;
  }
  const db = getDb();
  const account = await fetchUser(db, payload.username);
  res
    .status(200)
    .json({ message: "successful", result: account, isAdmin: payload.isAdmin });
  return;
});

router.post("/login", login);
router.post("/logout", logout);

router.get("/users", [validateCookie, fetchUsers]);

// udpate infomation like credentials
router.put("/update", [validateCookie, validateActive, updateCredentials]);

// admin priviledge
router.use("/admin", [validateCookie, adminOnly]);
router.post("/admin/register", register);
// router.post("/admin/reset", adminResetAccount);

export default router;

// TODO: create one selfOrAdmin
