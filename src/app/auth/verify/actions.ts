"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/lib/auth";
import { hashToken } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";

export interface VerifyResult {
  ok?: true;
  redirectTo?: string;
  error?: string;
}

export async function verifyMagicLinkAction(input: { token: string }): Promise<VerifyResult> {
  if (!input.token || input.token.length < 20) {
    return { error: "Link geçersiz veya bozuk." };
  }

  // Authorize'da token consume edilmeden ÖNCE email'i alalım — sonradan
  // kullanıcının onboarding durumuna göre redirect yönü için lazım.
  // (authorize transaction içinde consume eder; biz sadece okuyoruz.)
  const tokenHash = hashToken(input.token);
  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
    select: { email: true, expiresAt: true, consumedAt: true },
  });

  if (!record) return { error: "Link geçersiz." };
  if (record.consumedAt) return { error: "Bu link daha önce kullanıldı. Yeni bir tane iste." };
  if (record.expiresAt.getTime() < Date.now())
    return { error: "Link süresi doldu. Yeni bir tane iste." };

  try {
    await signIn("credentials", { token: input.token, redirect: false });
  } catch (err) {
    console.error("[verify] signIn failed", err);
    if (err instanceof CredentialsSignin) return { error: "Link geçersiz veya süresi dolmuş." };
    if (err instanceof AuthError) return { error: "Sunucu hatası." };
    throw err;
  }

  // Redirect: yeni kullanıcı (onboarding tamamlanmamış) → /onboarding/name, mevcut → /learn
  const user = await prisma.user.findUnique({
    where: { email: record.email },
    select: { onboardingCompleted: true },
  });
  const redirectTo = user?.onboardingCompleted ? "/learn" : "/onboarding/name";
  return { ok: true, redirectTo };
}
