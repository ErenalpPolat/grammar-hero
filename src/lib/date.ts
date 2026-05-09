/** Minimal date helpers — no date-fns yet. */

export function formatDate(d: Date | string | number, locale: string = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(d));
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * UTC midnight of the same calendar date in UTC. Server-side day comparisons
 * (streak, daily activity) bunu kullanmalı çünkü Prisma `@db.Date` UTC tarihini
 * extract eder. Lokal startOfDay timezone offset yüzünden tarih kayması yapar.
 */
export function startOfDayUtc(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export function addDaysUtc(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 0=Pzt … 6=Paz (ISO week, not Sunday-first) */
export function isoDayOfWeek(d: Date): number {
  const js = d.getDay(); // 0=Sun .. 6=Sat
  return (js + 6) % 7;
}
