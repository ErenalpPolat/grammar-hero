"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { addDaysUtc, startOfDayUtc } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { applySM2, type ReviewQuality } from "@/lib/sm2";

const STARTER_CARDS: Array<{ front: string; back: string; hint?: string }> = [
  { front: "She ___ to school.", back: "She goes to school.", hint: "3. tekil · go" },
  { front: "He ___ pizza.", back: "He likes pizza.", hint: "-s ekle" },
  { front: "My cat ___ milk.", back: "My cat drinks milk.", hint: "3. tekil" },
  { front: "___ she speak English?", back: "Does she speak English?", hint: "3. tekil yardımcı" },
  { front: "He ___ watch TV.", back: "He doesn't watch TV.", hint: "olumsuz · 3. tekil" },
  { front: "She ___ go to school yesterday.", back: "She didn't go to school yesterday.", hint: "didn't + yalın" },
  { front: "I ___ a great movie last night.", back: "I saw a great movie last night.", hint: "see → saw (düzensiz)" },
  { front: "What ___ you doing now?", back: "What are you doing now?", hint: "Present Continuous soru" },
];

/** Seed starter review cards for the user (idempotent — only seeds if user has none) */
export async function seedReviewCardsIfEmpty(userId: string): Promise<void> {
  const existing = await prisma.reviewCard.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.reviewCard.createMany({
    data: STARTER_CARDS.map((card) => ({ userId, ...card })),
  });
}

export interface DueCard {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  /** Total cards (for progress display) */
  totalDue: number;
}

/** Fetch the next due card (or null if none) */
export async function getNextDueCard(): Promise<DueCard | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [card, totalDue] = await Promise.all([
    prisma.reviewCard.findFirst({
      where: { userId: session.user.id, nextReviewAt: { lte: todayEnd } },
      orderBy: { nextReviewAt: "asc" },
      select: { id: true, front: true, back: true, hint: true },
    }),
    prisma.reviewCard.count({
      where: { userId: session.user.id, nextReviewAt: { lte: todayEnd } },
    }),
  ]);

  if (!card) return null;
  return { ...card, totalDue };
}

export interface RateCardResult {
  ok?: true;
  error?: string;
  /** Days until this card's next review */
  nextIn?: number;
  /** Are there still due cards after this one? */
  hasMore?: boolean;
}

export async function rateCardAction(input: {
  cardId: string;
  quality: ReviewQuality;
}): Promise<RateCardResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum yok" };

  const card = await prisma.reviewCard.findFirst({
    where: { id: input.cardId, userId: session.user.id },
    select: { easinessFactor: true, interval: true, repetitions: true },
  });
  if (!card) return { error: "Kart bulunamadı" };

  const next = applySM2(card, input.quality);
  const nextReviewAt = addDaysUtc(startOfDayUtc(new Date()), next.interval);

  await prisma.reviewCard.update({
    where: { id: input.cardId },
    data: {
      easinessFactor: next.easinessFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      nextReviewAt,
      lastReviewedAt: new Date(),
    },
  });

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const remainingDue = await prisma.reviewCard.count({
    where: { userId: session.user.id, nextReviewAt: { lte: todayEnd } },
  });

  revalidatePath("/review");

  return { ok: true, nextIn: next.interval, hasMore: remainingDue > 0 };
}

export interface AddReviewCardsResult {
  ok?: true;
  added?: number;
  error?: string;
}

/**
 * Batch-insert review cards. De-duplicates by (front, back) against the user's existing
 * deck — replaying the same wrong answer won't multiply the card.
 * Called from quiz completion with wrong/skipped exercises.
 */
export async function addReviewCardsAction(input: {
  cards: { front: string; back: string; hint?: string }[];
}): Promise<AddReviewCardsResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum yok" };

  const userId = session.user.id;
  if (input.cards.length === 0) return { ok: true, added: 0 };

  const fronts = input.cards.map((c) => c.front);
  const existing = await prisma.reviewCard.findMany({
    where: { userId, front: { in: fronts } },
    select: { front: true, back: true },
  });
  const existingKey = new Set(existing.map((e) => `${e.front}\u0000${e.back}`));
  const toCreate = input.cards.filter(
    (c) => !existingKey.has(`${c.front}\u0000${c.back}`),
  );

  if (toCreate.length === 0) return { ok: true, added: 0 };

  await prisma.reviewCard.createMany({
    data: toCreate.map((c) => ({
      userId,
      front: c.front,
      back: c.back,
      hint: c.hint,
    })),
  });

  revalidatePath("/review");
  return { ok: true, added: toCreate.length };
}
