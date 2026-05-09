"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gemsForQuiz, levelFromXp, starsFromAccuracy } from "@/lib/exercise/xp";
import { addLeagueXp } from "@/lib/league";
import { computeNewStreak } from "@/lib/streak";
import { startOfDayUtc } from "@/lib/date";
import type { GameType } from "@/lib/exercise/types";

const VALID_GAMES: GameType[] = [
  "multiple-choice",
  "fill-in-blank",
  "true-false",
  "word-bank",
  "word-scramble",
  "find-mistake",
  "drag-drop",
  "memory-match",
];

export interface QuizCompletionInput {
  lessonId: string;
  gameType: GameType;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  heartsLeft: number;
  heartsMax: number;
  xpEarned: number;
  /** Approximate minutes spent on the quiz. Optional; defaults to 3. */
  minutesSpent?: number;
}

export interface QuizCompletionResult {
  ok?: true;
  error?: string;
  /** Updated user state */
  user?: {
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    gems: number;
  };
  newBest?: boolean;
  /** Level transition (null if no level up) */
  levelUp?: { from: number; to: number } | null;
  /** Streak break info — present when previous streak (>1) was lost due to gap */
  streakBroken?: { previousStreak: number } | null;
  /** Daily goal just crossed for first time today */
  goalReached?: { goalMinutes: number; minutesNow: number } | null;
}

export async function recordQuizCompletionAction(
  input: QuizCompletionInput,
): Promise<QuizCompletionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum yok" };

  if (!VALID_GAMES.includes(input.gameType)) return { error: "Geçersiz oyun tipi" };
  if (input.totalQuestions <= 0) return { error: "Geçersiz soru sayısı" };
  if (input.correctCount < 0 || input.wrongCount < 0) return { error: "Geçersiz sayaç" };
  if (input.xpEarned < 0 || input.xpEarned > 10_000) return { error: "Geçersiz XP" };

  const userId = session.user.id;
  const score = Math.round((input.correctCount / input.totalQuestions) * 100);
  const stars = starsFromAccuracy(score);
  const gems = gemsForQuiz(stars);
  const passed = score >= 60;
  const todayStart = startOfDayUtc(new Date());
  // Quiz'de gerçekten geçirilen dakika (frontend ölçer). Yoksa minimum 1 dk.
  const minutes = Math.max(1, Math.min(60, input.minutesSpent ?? 1));

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        gems: true,
        currentLevel: true,
        dailyGoalMinutes: true,
      },
    });
    if (!user) throw new Error("User not found");

    const newStreak = computeNewStreak(user.lastActivityDate, todayStart, user.currentStreak);
    const newTotalXp = user.totalXp + input.xpEarned;
    const newLevel = levelFromXp(newTotalXp);
    const leveledUp = newLevel > user.currentLevel;
    // Streak break: previous streak was > 1 AND new streak reset to 1 (gap > 1 day)
    const streakBroken =
      user.currentStreak > 1 && newStreak === 1 && user.lastActivityDate != null;

    // GameAttempt
    await tx.gameAttempt.create({
      data: {
        userId,
        lessonId: input.lessonId,
        gameType: input.gameType,
        score,
        correctCount: input.correctCount,
        wrongCount: input.wrongCount,
        heartsLeft: input.heartsLeft,
        xpEarned: input.xpEarned,
      },
    });

    // LessonProgress upsert
    const existingProgress = await tx.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: input.lessonId } },
      select: { bestScore: true, firstCompletedAt: true, attempts: true },
    });
    const newBest = passed && score > (existingProgress?.bestScore ?? 0);

    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: input.lessonId } },
      create: {
        userId,
        lessonId: input.lessonId,
        bestScore: passed ? score : 0,
        attempts: 1,
        firstCompletedAt: passed ? new Date() : null,
      },
      update: {
        attempts: { increment: 1 },
        bestScore: newBest ? score : existingProgress?.bestScore ?? 0,
        firstCompletedAt:
          existingProgress?.firstCompletedAt ?? (passed ? new Date() : null),
        lastAttemptAt: new Date(),
      },
    });

    // DailyActivity upsert — capture before/after minutes for goal detection
    const beforeActivity = await tx.dailyActivity.findUnique({
      where: { userId_date: { userId, date: todayStart } },
      select: { minutesSpent: true },
    });
    const minutesBefore = beforeActivity?.minutesSpent ?? 0;
    const minutesAfter = minutesBefore + minutes;
    const goalMinutes = user.dailyGoalMinutes ?? 10;
    const goalReached = minutesBefore < goalMinutes && minutesAfter >= goalMinutes;

    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: todayStart } },
      create: {
        userId,
        date: todayStart,
        lessonsCompleted: passed ? 1 : 0,
        xpEarned: input.xpEarned,
        minutesSpent: minutes,
      },
      update: {
        lessonsCompleted: { increment: passed ? 1 : 0 },
        xpEarned: { increment: input.xpEarned },
        minutesSpent: { increment: minutes },
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        gems: user.gems + gems,
        lastActivityDate: todayStart,
      },
    });

    // Lig XP: önceki haftaları finalize et + current-week membership ensure + increment.
    // Burada çağrı yeri önemli — user.update'ten sonra (leagueTier finalize sırasında değişebilir,
    // ve podium gems user.gems'e ekleniyor). addLeagueXp kendi tier okuması yapıyor.
    await addLeagueXp(tx, userId, input.xpEarned);

    const updatedUser = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        totalXp: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
        gems: true,
      },
    });

    return {
      updatedUser,
      newBest,
      levelUp: leveledUp ? { from: user.currentLevel, to: newLevel } : null,
      streakBroken: streakBroken ? { previousStreak: user.currentStreak } : null,
      goalReached: goalReached
        ? { goalMinutes, minutesNow: minutesAfter }
        : null,
    };
  });

  revalidatePath("/learn");
  revalidatePath("/learn/(.*)", "layout");
  revalidatePath("/profile");
  revalidatePath("/leaderboard");

  return {
    ok: true,
    user: result.updatedUser,
    newBest: result.newBest,
    levelUp: result.levelUp,
    streakBroken: result.streakBroken,
    goalReached: result.goalReached,
  };
}
