import express from "express";

import {
  fetchUsers,
  login,
  logout,
  register,
  updateCredentials,
} from "../../controllers/auth";
import { authorizedGroups, validateCookie } from "../../middleware/auth";
import { AccountDB, getDb, UserGroupDB } from "../../services/db";
import { verifyToken } from "../../services/jwt";

const router = express.Router();

router.get("/validate", validateCookie, async (req, res) => {
  console.log("[validate]");
  if (!req.cookies["token"]) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }

  const payload = verifyToken(
    req.cookies.token,
    process.env.ENV_SECRET as string
  );

  if (payload == null) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }

  const db = getDb();
  const account = await AccountDB.fetchUser(db, payload.username);

  res.status(200).json({
    message: "successful",
    result: account,
    isAdmin: await UserGroupDB.Checkgroup(payload.username, "admin"),
  });
  return;
});

router.post("/login", login);
router.post("/logout", logout);

router.post("/fetchUsers", [validateCookie, fetchUsers]);

// udpate infomation like credentials
router.post("/updateUser", [validateCookie, updateCredentials]);

// admin priviledge
router.use("/admin", [validateCookie, authorizedGroups(["ADMIN"])]);
router.post("/admin/register", register);

export default router;
