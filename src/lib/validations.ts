import { z } from "zod";

export const LoginSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "En az 2 karakter")
    .max(40, "En fazla 40 karakter"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

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
