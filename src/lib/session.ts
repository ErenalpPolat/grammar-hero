import { redirect } from "next/navigation";
import { getTodayMinutes } from "@/lib/activity";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
  id: string;
  name: string;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  gems: number;
  hearts: number;
  dailyGoalMinutes: number;
  /** Bugün bu kadar dakika pratik edildi (DailyActivity tablosundan) */
  dailyMinutes: number;
  onboardingCompleted: boolean;
  level: string | null;
}

export async function requireSessionUser(options?: { allowIncompleteOnboarding?: boolean }): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      totalXp: true,
      currentLevel: true,
      currentStreak: true,
      gems: true,
      hearts: true,
      dailyGoalMinutes: true,
      onboardingCompleted: true,
      level: true,
    },
  });
  if (!user) redirect("/login");

  if (!user.onboardingCompleted && !options?.allowIncompleteOnboarding) {
    redirect("/onboarding/name");
  }

  const dailyMinutes = await getTodayMinutes(user.id);

  return {
    ...user,
    dailyGoalMinutes: user.dailyGoalMinutes ?? 10,
    dailyMinutes,
  };
}
