import { z } from "zod";

/** Magic link request — sadece e-posta gerekli. */
export const MagicLinkRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Geçerli bir e-posta yaz")
    .max(254, "Çok uzun")
    .email("Geçerli bir e-posta yaz"),
});

export type MagicLinkRequest = z.infer<typeof MagicLinkRequestSchema>;

/** Verify (Credentials.authorize input) — token ham hali ile gelir, server hash'leyip karşılaştırır. */
export const MagicLinkVerifySchema = z.object({
  token: z.string().min(20, "Geçersiz token"),
});

export const OnboardingNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "En az 2 karakter")
    .max(40, "En fazla 40 karakter"),
});

export const LEVELS = ["newbie", "a1-a2", "b1-b2", "c1-plus"] as const;
export const OnboardingLevelSchema = z.object({
  level: z.enum(LEVELS),
});

export const DAILY_GOALS = [5, 10, 15, 20] as const;
export const OnboardingGoalSchema = z.object({
  dailyGoalMinutes: z
    .coerce.number()
    .int()
    .refine((n) => (DAILY_GOALS as readonly number[]).includes(n), {
      message: "Geçerli hedef: 5, 10, 15 veya 20 dk",
    }),
});
