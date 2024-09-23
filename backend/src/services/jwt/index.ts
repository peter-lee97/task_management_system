import assert from "assert";
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
  assert(secret, "secret cannot be null");
  return jwt.sign(
    {
      ipAddress: jwtPayload.ipAddress,
      userAgent: jwtPayload.userAgent,
      username: jwtPayload.username,
    },
    secret,
    {
      expiresIn,
    }
  );
};

export const verifyToken = (
  token: string | null,
  secret: string
): AccountPayload | null => {
  if (token == null) return null;
  let parsePayload;
  try {
    const payload = jwt.verify(token, secret);
    parsePayload = JSON.parse(JSON.stringify(payload));
    return {
      ipAddress: parsePayload["ipAddress"],
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
