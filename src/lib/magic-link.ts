import { createHash, randomBytes } from "crypto";

/**
 * Magic link token üretir + DB'ye kaydedilecek hash'ini hesaplar.
 *
 * - `raw`: e-postada / linkte kullanıcıya gönderilen ham token
 * - `hash`: DB'de saklanan SHA-256 hash (raw asla saklanmaz)
 *
 * Hash karşılaştırma sayesinde DB sızsa bile hiçbir token replay edilemez.
 */
export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  const hash = hashToken(raw);
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Magic link expiry — 15 dk standart. */
export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
