import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountPayload } from "../../model/index";

export const generateToken = ({
  secret,
  jwtPayload,
  expiresIn,
}: {
  expiresIn: string;
  jwtPayload: AccountPayload;
  secret: string;
}): string => {
  return jwt.sign(
    {
      isAdmin: jwtPayload.isAdmin,
      ipAddress: jwtPayload.ipAddress,
      userAgent: jwtPayload.userAgent,
      username: jwtPayload.username,
    },
    secret,
    {
      expiresIn: expiresIn,
    }
  );
};

export const verifyToken = (
  token: string,
  secret: string
): AccountPayload | null => {
  let parsePayload;
  try {
    const payload = jwt.verify(token, secret);
    parsePayload = JSON.parse(JSON.stringify(payload));
    return {
      ipAddress: parsePayload["ipAddress"],
      isAdmin: parsePayload["isAdmin"],
      userAgent: parsePayload["userAgent"],
      username: parsePayload["username"],
    };
  } catch (error) {
    console.error(`Failed to verify token: ${error}`);
  }
  return null;
};

export const hashPassword = async (password: string, saltRound = 10) =>
  hash(password, saltRound);

export const compareHash = async (
  password: string,
  hashPassword: string
): Promise<boolean> => compare(password, hashPassword);
