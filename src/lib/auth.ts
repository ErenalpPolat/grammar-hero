import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
        name: { label: "Ad", type: "text" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[auth/authorize] schema validation failed", parsed.error.issues);
          return null;
        }
        const { email, password, name } = parsed.data;

        try {
          const existing = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              passwordHash: true,
              onboardingCompleted: true,
            },
          });

          if (existing) {
            // Mevcut hesap → şifre doğrula
            const ok = await verifyPassword(password, existing.passwordHash);
            if (!ok) {
              console.warn("[auth/authorize] wrong password for", email);
              return null;
            }
            return {
              id: existing.id,
              name: existing.name,
              onboardingCompleted: existing.onboardingCompleted,
            };
          }

          // Yeni kullanıcı → ad + e-posta + şifre ile hesap oluştur
          const hash = await hashPassword(password);
          const user = await prisma.user.create({
            data: {
              email,
              name,
              passwordHash: hash,
              targetLanguage: "en",
            },
            select: { id: true, name: true, onboardingCompleted: true },
          });
          return user;
        } catch (err) {
          console.error("[auth/authorize] failed", err);
          throw err;
        }
      },
    }),
  ],
});
