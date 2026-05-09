import { prisma } from "@/lib/prisma";
import { MOCK_UNITS } from "@/lib/learn/mock-data";
import type { CefrLevel, Lesson, LessonStatus, Unit } from "@/lib/learn/types";

/** Fetch LessonProgress map for a user (lessonId → progress row) */
async function getProgressMap(userId: string) {
  const rows = await prisma.lessonProgress.findMany({
    where: { userId },
    select: { lessonId: true, bestScore: true, firstCompletedAt: true },
  });
  const map = new Map<string, { bestScore: number; completed: boolean }>();
  for (const row of rows) {
    map.set(row.lessonId, {
      bestScore: row.bestScore,
      completed: row.firstCompletedAt != null,
    });
  }
  return map;
}

/**
 * Onboarding'de seçilen level (`User.level`) → kullanıcıya gösterilecek
 * CEFR seviyeleri kümesi. Kullanıcı yalnız bu seviyelerdeki unit'leri görür.
 *
 * - newbie / a1-a2  → A1 + A2 (temelden başla)
 * - b1-b2           → B1 + B2 (orta seviye direkt)
 * - c1-plus         → C1 (ileri)
 * - null / bilinmez → tüm seviyeler (defansif fallback)
 */
function levelsForUser(userLevel: string | null | undefined): Set<CefrLevel> {
  switch (userLevel) {
    case "newbie":
    case "a1-a2":
      return new Set(["a1", "a2"]);
    case "b1-b2":
      return new Set(["b1", "b2"]);
    case "c1-plus":
      return new Set(["c1"]);
    default:
      return new Set(["a1", "a2", "b1", "b2", "c1"]);
  }
}

/**
 * Compute units with real status from DB. The mock metadata (title, icon, unit structure)
 * stays; statuses become:
 *
 * - A lesson is `completed` if it has a LessonProgress row with firstCompletedAt set
 * - The first lesson of the first unit is always `available` if not completed
 * - A lesson becomes `available` when its predecessor (previous lesson in same unit) is completed
 * - A unit is `locked` if the previous unit isn't fully completed
 * - All lessons inside a locked unit are `locked`
 *
 * Kullanıcının seçtiği `level`'a göre unit listesi önce filtrelenir — kullanıcı
 * yalnız kendi seviyesindeki unit'leri görür.
 */
export async function getUnitsWithProgress(
  userId: string,
  userLevel?: string | null,
): Promise<Unit[]> {
  const progress = await getProgressMap(userId);
  const allowedLevels = levelsForUser(userLevel);
  const filteredUnits = MOCK_UNITS.filter((u) => allowedLevels.has(u.cefrLevel));

  let prevUnitComplete = true; // first unit is always unlocked
  return filteredUnits.map((unit) => {
    const unitUnlocked = prevUnitComplete;
    const lessons: Lesson[] = [];
    let prevLessonComplete = unitUnlocked;

    for (const lesson of unit.lessons) {
      const p = progress.get(lesson.id);
      let status: LessonStatus;
      if (!unitUnlocked) {
        status = "locked";
      } else if (p?.completed) {
        status = "completed";
      } else if (prevLessonComplete) {
        status = "available";
      } else {
        status = "locked";
      }

      lessons.push({
        ...lesson,
        status,
        bestScore: p?.bestScore ?? undefined,
        progress: status === "completed" ? 100 : status === "available" ? 0 : undefined,
      });

      prevLessonComplete = p?.completed === true;
    }

    const unitStatus: LessonStatus = unitUnlocked ? "available" : "locked";
    const unitComplete = lessons.every((l) => l.status === "completed");
    prevUnitComplete = unitComplete;

    return {
      ...unit,
      status: unitStatus,
      lessons,
    };
  });
}

export async function findLessonWithProgress(
  userId: string,
  lessonId: string,
  userLevel?: string | null,
) {
  const units = await getUnitsWithProgress(userId, userLevel);
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
}
