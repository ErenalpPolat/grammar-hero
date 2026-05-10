import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[auth/authorize] schema validation failed", parsed.error.issues);
          return null;
        }
        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              passwordHash: true,
              onboardingCompleted: true,
            },
          });

          if (!user) {
            console.warn("[auth/authorize] user not found", email);
            return null;
          }

          const ok = await verifyPassword(password, user.passwordHash);
          if (!ok) {
            console.warn("[auth/authorize] wrong password for", email);
            return null;
          }

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
