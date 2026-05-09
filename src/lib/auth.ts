import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { hashToken } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";
import { MagicLinkVerifySchema } from "@/lib/validations";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      // Magic link: form yok, token URL'den gelir.
      credentials: { token: { label: "Token", type: "text" } },
      async authorize(credentials) {
        const parsed = MagicLinkVerifySchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[auth/authorize] schema validation failed", parsed.error.issues);
          return null;
        }
        const tokenHash = hashToken(parsed.data.token);

        try {
          // Atomic: bul + consume (race condition'a karşı transaction)
          const user = await prisma.$transaction(async (tx) => {
            const record = await tx.magicLinkToken.findUnique({
              where: { tokenHash },
              select: { id: true, email: true, expiresAt: true, consumedAt: true },
            });
            if (!record) {
              console.warn("[auth/authorize] token not found");
              return null;
            }
            if (record.consumedAt) {
              console.warn("[auth/authorize] token already consumed", record.id);
              return null;
            }
            if (record.expiresAt.getTime() < Date.now()) {
              console.warn("[auth/authorize] token expired", record.id);
              return null;
            }

            // Tek kullanımlık: hemen consume
            await tx.magicLinkToken.update({
              where: { id: record.id },
              data: { consumedAt: new Date() },
            });

            // Kullanıcıyı upsert et (yeni kullanıcı → email prefix default ad)
            const defaultName = record.email.split("@")[0]?.slice(0, 40) || "kullanıcı";
            return tx.user.upsert({
              where: { email: record.email },
              update: {},
              create: { email: record.email, name: defaultName, targetLanguage: "en" },
              select: { id: true, name: true, onboardingCompleted: true },
            });
          });

          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            onboardingCompleted: user.onboardingCompleted,
          };
        } catch (err) {
          console.error("[auth/authorize] failed", err);
          throw err;
        }
      },
    }),
  ],
});
