import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { userIdFromName } from "@/lib/slugify";
import { LoginSchema } from "@/lib/validations";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        name: { label: "Ad", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[auth/authorize] schema validation failed", parsed.error.issues);
          return null;
        }
        const { name, password } = parsed.data;
        const id = userIdFromName(name);

        try {
          const existing = await prisma.user.findUnique({
            where: { id },
            select: {
              id: true,
              name: true,
              passwordHash: true,
              onboardingCompleted: true,
            },
          });

          if (existing) {
            // Legacy hesap (passwordHash null) → ilk girişte şifreyi set et (claim)
            if (!existing.passwordHash) {
              const hash = await hashPassword(password);
              await prisma.user.update({
                where: { id },
                data: { passwordHash: hash },
              });
              return {
                id: existing.id,
                name: existing.name,
                onboardingCompleted: existing.onboardingCompleted,
              };
            }
            // Şifre kontrol
            const ok = await verifyPassword(password, existing.passwordHash);
            if (!ok) {
              console.warn("[auth/authorize] wrong password for", id);
              return null;
            }
            return {
              id: existing.id,
              name: existing.name,
              onboardingCompleted: existing.onboardingCompleted,
            };
          }

          // Yeni kullanıcı → oluştur, şifresini hashle
          const hash = await hashPassword(password);
          const user = await prisma.user.create({
            data: { id, name, targetLanguage: "en", passwordHash: hash },
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
