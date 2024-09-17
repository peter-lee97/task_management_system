import express from "express";
import assert from "node:assert";
import {
  fetchUsers,
  login,
  logout,
  register,
  updateCredentials,
} from "../../controllers/auth";
import { adminOnly, validateCookie } from "../../middleware/auth";
import { getDb } from "../../services/db";
import { fetchUser } from "../../services/db/account";

const router = express.Router();

router.get("/validate", validateCookie, async (req, res) => {
  if (!req.cookies["token"]) {
    res.status(401).json({ message: "User not authenticated, please login" });
    return;
  }

  assert(req.accountPayload != null, "req account payload should exists");
  const db = getDb();
  const account = await fetchUser(db, req.accountPayload!.username);

  res.status(200).json({
    message: "successful",
    result: account,
    isAdmin: req.accountPayload.isAdmin,
  });
  return;
});

router.post("/login", login);
router.post("/logout", logout);

router.get("/users", [validateCookie, fetchUsers]);

// udpate infomation like credentials
router.put("/update", [validateCookie, updateCredentials]);

// admin priviledge
router.use("/admin", [validateCookie, adminOnly]);
router.post("/admin/register", register);

export default router;

// TODO: create one selfOrAdmin
