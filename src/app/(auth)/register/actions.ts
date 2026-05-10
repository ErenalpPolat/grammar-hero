"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { RegisterSchema } from "@/lib/validations";

export interface RegisterActionResult {
  ok?: true;
  redirectTo?: string;
  error?: string;
}

export async function registerAction(input: {
  email: string;
  name: string;
  password: string;
  callbackUrl?: string | null;
}): Promise<RegisterActionResult> {
  const parsed = RegisterSchema.safeParse({
    email: input.email,
    name: input.name,
    password: input.password,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş" };
  }

  // Rate limit per IP — 3 hesap/dk (signup spam'a karşı)
  const headerStore = await headers();
  const cfIp = headerStore.get("cf-connecting-ip");
  const forwarded = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = cfIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  const rl = checkRateLimit(`register:${ip}`, { maxAttempts: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return {
      error: `Çok fazla kayıt denemesi. ${rl.resetInSeconds} saniye sonra tekrar dene.`,
    };
  }

  // E-posta zaten alınmış mı?
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      error: "Bu e-posta zaten kayıtlı. Giriş sayfasından gir.",
    };
  }

  try {
    const hash = await hashPassword(parsed.data.password);
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash: hash,
        targetLanguage: "en",
      },
    });
  } catch (err) {
    console.error("[register] create failed", err);
    return { error: "Hesap oluşturulamadı. Tekrar dene." };
  }

  // Otomatik giriş yap
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    console.error("[register] auto sign-in failed", err);
    if (err instanceof AuthError) {
      // Hesap oluştu ama auto sign-in tutmadı — login'e yönlendir
      return { ok: true, redirectTo: "/login" };
    }
    throw err;
  }

  // Yeni hesap → onboarding'e gönder
  return { ok: true, redirectTo: "/onboarding/level" };
}
