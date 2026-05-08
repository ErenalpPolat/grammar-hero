import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { userIdFromName } from "@/lib/slugify";
import { LoginSchema } from "@/lib/validations";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { name: { label: "Ad", type: "text" } },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[auth/authorize] schema validation failed", parsed.error.issues);
          return null;
        }
        const name = parsed.data.name;
        const id = userIdFromName(name);
        try {
          const user = await prisma.user.upsert({
            where: { id },
            update: {},
            create: { id, name, targetLanguage: "en" },
            select: { id: true, name: true, onboardingCompleted: true },
          });
          return { id: user.id, name: user.name, onboardingCompleted: user.onboardingCompleted };
        } catch (err) {
          // Surface DB errors in host logs — common cause is missing tables
          // (run `prisma migrate deploy`) or wrong DATABASE_URL.
          console.error("[auth/authorize] prisma upsert failed", err);
          throw err;
        }
      },
    }),
  ],
});
