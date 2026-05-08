import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config — no DB or provider authorize functions.
 * Used by `proxy.ts` (middleware) which must stay lean.
 * Full config (with Credentials provider + Prisma) is in `auth.ts`.
 */
export const authConfig = {
  // VPS / self-hosted: yokluğunda trustHost yalnız VERCEL/CF_PAGES env'i varsa
  // true oluyor; Contabo gibi kendi sunucumuzda manuel açıyoruz. Nginx
  // X-Forwarded-Host / X-Forwarded-Proto header'larını forward etmeli.
  trustHost: true,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.onboardingCompleted =
          (user as { onboardingCompleted?: boolean }).onboardingCompleted ?? false;
      }
      if (trigger === "update" && session) {
        if (typeof session.onboardingCompleted === "boolean") {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (typeof token.onboardingCompleted === "boolean") {
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
