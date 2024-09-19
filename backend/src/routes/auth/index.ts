import express from "express";
import {
  fetchUsers,
  login,
  logout,
  register,
  updateCredentials,
} from "../../controllers/auth";
import { authorizedGroups, validateCookie } from "../../middleware/auth";
import { getDb } from "../../services/db";
import { fetchUser } from "../../services/db/account";
import { verifyToken } from "../../services/jwt";

const router = express.Router();

router.get("/validate", validateCookie, async (req, res) => {
  if (!req.cookies["token"]) {
    res.status(401).json({ message: "User not authenticated, please login" });
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
  const account = await fetchUser(db, payload.username);

  res.status(200).json({
    message: "successful",
    result: account,
    isAdmin: payload.isAdmin,
  });

  return;
});

router.post("/login", login);
router.post("/logout", logout);

router.get("/users", [validateCookie, fetchUsers]);

// udpate infomation like credentials
router.put("/update", [validateCookie, updateCredentials]);

// admin priviledge
router.use("/admin", [
  validateCookie,
  authorizedGroups(["ADMIN"], process.env.ENV_SECRET as string),
]);
router.post("/admin/register", register);

export default router;
