import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Geçerli bir e-posta yaz")
  .max(254, "Çok uzun")
  .email("Geçerli bir e-posta yaz");

/** Login: sadece var olan hesabı doğrular, şifre güçlülüğü zaten kayıtta zorlandı. */
export const LoginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Şifreni gir")
    .max(100, "Şifre çok uzun"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/** Register: yeni hesap oluşturur, şifre güçlülük kontrolü burada. */
export const RegisterSchema = z.object({
  email: emailField,
  name: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter")
    .max(40, "Ad en fazla 40 karakter"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(100, "Şifre çok uzun")
    .regex(/[a-z]/, "Şifrede en az 1 küçük harf olmalı")
    .regex(/[A-Z]/, "Şifrede en az 1 BÜYÜK harf olmalı")
    .regex(/\d/, "Şifrede en az 1 sayı olmalı"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

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
