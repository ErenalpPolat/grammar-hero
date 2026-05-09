"use server";

import { headers } from "next/headers";
import { generateToken, MAGIC_LINK_TTL_MS } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { MagicLinkRequestSchema } from "@/lib/validations";

export interface SendMagicLinkResult {
  ok?: true;
  error?: string;
}

export async function sendMagicLinkAction(input: {
  email: string;
}): Promise<SendMagicLinkResult> {
  const parsed = MagicLinkRequestSchema.safeParse({ email: input.email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta" };
  }
  const email = parsed.data.email;

  // Rate limit per IP — abuse prevention
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const cfIp = headerStore.get("cf-connecting-ip"); // Cloudflare proxy
  const ip = cfIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  const rl = checkRateLimit(`magic:${ip}`, { maxAttempts: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return {
      error: `Çok fazla deneme. ${rl.resetInSeconds} saniye sonra tekrar dene.`,
    };
  }

  // Per-email rate limit — aynı e-postaya 1 dk içinde 3'ten fazla link gönderme
  const emailRl = checkRateLimit(`magic-email:${email}`, {
    maxAttempts: 3,
    windowMs: 60_000,
  });
  if (!emailRl.allowed) {
    return {
      error: `Bu e-posta için çok fazla deneme. ${emailRl.resetInSeconds} sn sonra tekrar dene.`,
    };
  }

  try {
    const { raw, hash } = generateToken();
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    // Önceki kullanılmamış token'ları geçersiz kıl (kullanıcı yeni link isterse eskisi ölsün)
    await prisma.magicLinkToken.updateMany({
      where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });

    await prisma.magicLinkToken.create({
      data: { email, tokenHash: hash, expiresAt },
    });

    // Base URL'i request header'larından çıkar (Cloudflare proxy arkası dahil çalışır)
    const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
    const proto = headerStore.get("x-forwarded-proto") || "https";
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : "http://localhost:3000");
    const link = `${baseUrl}/auth/verify?token=${encodeURIComponent(raw)}`;

    // MOCK: e-posta yerine PM2 logs'a bas. Gerçek e-postaya geçince Resend/Brevo entegrasyonu buraya.
    console.log("=".repeat(70));
    console.log(`[MAGIC LINK] ${email}`);
    console.log(`[MAGIC LINK] ${link}`);
    console.log(`[MAGIC LINK] Expires: ${expiresAt.toISOString()}`);
    console.log("=".repeat(70));
  } catch (err) {
    console.error("[magic-link] send failed", err);
    return { error: "Sunucu hatası. Tekrar dene." };
  }

  return { ok: true };
}
