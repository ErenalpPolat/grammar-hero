import { notFound, redirect } from "next/navigation";
import { QuizArena } from "@/components/quiz/quiz-arena";
import { findLessonQuiz } from "@/data/questions";
import type { GameType } from "@/lib/exercise/types";
import { findLessonWithProgress } from "@/lib/learn/progress";
import { requireSessionUser } from "@/lib/session";

const VALID_GAME_TYPES: GameType[] = [
  "multiple-choice",
  "fill-in-blank",
  "true-false",
  "word-bank",
  "word-scramble",
  "find-mistake",
  "drag-drop",
  "memory-match",
];

export default async function QuizPage(props: PageProps<"/lesson/[lessonId]/quiz/[gameType]">) {
  const { lessonId, gameType } = await props.params;
  if (!VALID_GAME_TYPES.includes(gameType as GameType)) notFound();

  const user = await requireSessionUser();
  const ref = await findLessonWithProgress(user.id, lessonId, user.level);
  if (!ref) notFound();

  // Block locked lessons even via direct URL
  if (ref.lesson.status === "locked") redirect(`/learn/${ref.unit.slug}`);

  const quiz = findLessonQuiz(lessonId, gameType as GameType);
  if (!quiz) notFound();

  return (
    <QuizArena
      quiz={quiz}
      exitHref={`/lesson/${lessonId}`}
      lessonDetailHref={`/lesson/${lessonId}`}
    />
  );
}
