"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import {
  DAILY_GOALS,
  LEVELS,
} from "@/lib/validations";

export interface SettingsActionResult {
  ok?: true;
  error?: string;
}

export async function updateLearningPrefsAction(formData: FormData): Promise<SettingsActionResult> {
  const user = await requireSessionUser({ allowIncompleteOnboarding: true });

  const level = String(formData.get("level") ?? "");
  const goalRaw = String(formData.get("dailyGoalMinutes") ?? "");
  const goal = Number.parseInt(goalRaw, 10);

  if (!(LEVELS as readonly string[]).includes(level)) return { error: "Geçersiz seviye" };
  if (!(DAILY_GOALS as readonly number[]).includes(goal)) return { error: "Geçersiz hedef" };

  await prisma.user.update({
    where: { id: user.id },
    data: { level, dailyGoalMinutes: goal },
  });
  revalidatePath("/profile/settings");
  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteAccountAction(): Promise<never> {
  const user = await requireSessionUser({ allowIncompleteOnboarding: true });
  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirect: false });
  redirect("/");
}
