"use server";

import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { LoginSchema } from "@/lib/validations";

export interface LoginActionResult {
  ok?: true;
  redirectTo?: string;
  error?: string;
}

export async function loginAction(input: {
  email: string;
  password: string;
  callbackUrl?: string | null;
}): Promise<LoginActionResult> {
  const parsed = LoginSchema.safeParse({
    email: input.email,
    password: input.password,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş" };
  }

  // Rate limit per IP — 5 deneme/dk
  const headerStore = await headers();
  const cfIp = headerStore.get("cf-connecting-ip");
  const forwarded = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = cfIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  const rl = checkRateLimit(`login:${ip}`, { maxAttempts: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return {
      error: `Çok fazla giriş denemesi. ${rl.resetInSeconds} saniye sonra tekrar dene.`,
    };
  }

  // Önce hesap var mı bak — yoksa kullanıcıyı register'a yönlendir
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (!existing) {
    return {
      error: "Bu e-postayla bir hesap yok. Önce ücretsiz hesap aç.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    console.error("[login] signIn failed", err);
    if (err instanceof CredentialsSignin) {
      return { error: "Şifre yanlış. Tekrar dene." };
    }
    if (err instanceof AuthError) {
      return {
        error: "Sunucu hatası. Tekrar dene veya destek iste.",
      };
    }
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { onboardingCompleted: true },
  });

  let redirectTo = "/learn";
  if (!user?.onboardingCompleted) {
    redirectTo = "/onboarding/level";
  } else if (
    input.callbackUrl &&
    input.callbackUrl.startsWith("/") &&
    !input.callbackUrl.startsWith("//")
  ) {
    redirectTo = input.callbackUrl;
  }

  return { ok: true, redirectTo };
}
