"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { userIdFromName } from "@/lib/slugify";
import { LoginSchema } from "@/lib/validations";

export interface LoginActionResult {
  ok?: true;
  redirectTo?: string;
  error?: string;
}

export async function loginAction(input: {
  name: string;
  callbackUrl?: string | null;
}): Promise<LoginActionResult> {
  const parsed = LoginSchema.safeParse({ name: input.name });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş" };
  }

  // Rate limit per IP — 5 attempts / minute
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  const rl = checkRateLimit(`login:${ip}`, { maxAttempts: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return {
      error: `Çok fazla giriş denemesi. ${rl.resetInSeconds} saniye sonra tekrar dene.`,
    };
  }

  try {
    await signIn("credentials", {
      name: parsed.data.name,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Giriş başarısız. Tekrar dene." };
    }
    throw err;
  }

  // Look up the just-upserted user to decide where to redirect
  const id = userIdFromName(parsed.data.name);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { onboardingCompleted: true },
  });

  let redirectTo = "/learn";
  if (!user?.onboardingCompleted) {
    redirectTo = "/onboarding/level";
  } else if (input.callbackUrl && input.callbackUrl.startsWith("/") && !input.callbackUrl.startsWith("//")) {
    redirectTo = input.callbackUrl;
  }

  return { ok: true, redirectTo };
}
