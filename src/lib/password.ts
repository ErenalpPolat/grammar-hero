import { promisify } from "util";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LEN = 64;
const SALT_LEN = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const buf = await scryptAsync(password, salt, KEY_LEN);
  return `${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = Buffer.from(hashHex, "hex");
  if (hash.length !== KEY_LEN) return false;
  const candidate = await scryptAsync(password, salt, KEY_LEN);
  return timingSafeEqual(hash, candidate);
}
