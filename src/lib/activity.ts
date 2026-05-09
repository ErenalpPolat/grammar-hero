import { addDaysUtc, startOfDayUtc, toIsoDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

/**
 * Fetch daily lesson counts for the last `days` days, returned as a map of
 * ISO date (YYYY-MM-DD) → lesson count.
 */
export async function getActivityMap(userId: string, days = 180): Promise<Record<string, number>> {
  const today = startOfDayUtc(new Date());
  const since = addDaysUtc(today, -(days - 1));

  const rows = await prisma.dailyActivity.findMany({
    where: { userId, date: { gte: since, lte: today } },
    select: { date: true, lessonsCompleted: true },
  });

  const map: Record<string, number> = {};
  for (const r of rows) {
    map[toIsoDate(new Date(r.date))] = r.lessonsCompleted;
  }
  return map;
}

export interface ProfileSummary {
  lessonsCompleted: number;
  totalAttempts: number;
  totalMinutes: number;
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary> {
  const [completedAgg, attemptsCount, minutesAgg] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId, firstCompletedAt: { not: null } },
    }),
    prisma.gameAttempt.count({ where: { userId } }),
    prisma.dailyActivity.aggregate({
      where: { userId },
      _sum: { minutesSpent: true },
    }),
  ]);

  return {
    lessonsCompleted: completedAgg,
    totalAttempts: attemptsCount,
    totalMinutes: minutesAgg._sum.minutesSpent ?? 0,
  };
}

/** Today's minutes spent for the user (used by Topbar daily goal). */
export async function getTodayMinutes(userId: string): Promise<number> {
  const today = startOfDayUtc(new Date());
  const row = await prisma.dailyActivity.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { minutesSpent: true },
  });
  return row?.minutesSpent ?? 0;
}
