import { toIsoDate } from "./date";

/**
 * Compute new streak given last activity date, today, and current streak.
 *
 * Karşılaştırma UTC ISO date string'leri (YYYY-MM-DD) ile yapılır — local
 * `Date` math timezone offset'i nedeniyle aynı günde streak'i artırıyor olabilir.
 *
 * - No prior activity → 1
 * - Same UTC day → unchanged
 * - Consecutive UTC day (gap=1) → +1
 * - Gap > 1 day → 1 (reset)
 */
export function computeNewStreak(
  lastDate: Date | null | undefined,
  today: Date,
  current: number,
): number {
  if (!lastDate) return 1;

  const lastIso = toIsoDate(lastDate);
  const todayIso = toIsoDate(today);

  if (lastIso === todayIso) return Math.max(1, current);

  const lastMs = Date.parse(`${lastIso}T00:00:00Z`);
  const todayMs = Date.parse(`${todayIso}T00:00:00Z`);
  const diffDays = Math.round((todayMs - lastMs) / 86_400_000);

  if (diffDays === 1) return current + 1;
  return 1;
}
