"use client";

import type { Exercise } from "@/lib/exercise/types";
import { DragDrop } from "./games/drag-drop";
import { FillInBlank } from "./games/fill-in-blank";
import { FindMistake } from "./games/find-mistake";
import { MemoryMatch } from "./games/memory-match";
import { MultipleChoice } from "./games/multiple-choice";
import { TrueFalse } from "./games/true-false";
import { WordBank } from "./games/word-bank";
import { WordScramble } from "./games/word-scramble";

export interface GameHostProps {
  exercise: Exercise;
  answer: unknown;
  onAnswerChange: (answer: unknown) => void;
  locked: boolean;
  feedback: { correct: boolean } | null;
}

export function GameHost({ exercise, answer, onAnswerChange, locked, feedback }: GameHostProps) {
  switch (exercise.type) {
    case "multiple-choice":
      return (
        <MultipleChoice
          exercise={exercise}
          answer={typeof answer === "number" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "fill-in-blank":
      return (
        <FillInBlank
          exercise={exercise}
          answer={typeof answer === "number" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "true-false":
      return (
        <TrueFalse
          exercise={exercise}
          answer={typeof answer === "boolean" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "word-bank":
      return (
        <WordBank
          exercise={exercise}
          answer={Array.isArray(answer) ? (answer as string[]) : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "word-scramble":
      return (
        <WordScramble
          exercise={exercise}
          answer={typeof answer === "string" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "find-mistake":
      return (
        <FindMistake
          exercise={exercise}
          answer={typeof answer === "number" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "drag-drop":
      return (
        <DragDrop
          exercise={exercise}
          answer={typeof answer === "number" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
    case "memory-match":
      return (
        <MemoryMatch
          key={exercise.id}
          exercise={exercise}
          answer={typeof answer === "boolean" ? answer : null}
          onAnswerChange={onAnswerChange}
          locked={locked}
          feedback={feedback}
        />
      );
  }
}

/** Returns true if answer is "ready to submit" (non-null, non-empty for arrays) */
export function isAnswerReady(exercise: Exercise, answer: unknown): boolean {
  switch (exercise.type) {
    case "multiple-choice":
    case "fill-in-blank":
    case "find-mistake":
    case "drag-drop":
      return typeof answer === "number";
    case "true-false":
      return typeof answer === "boolean";
    case "memory-match":
      return answer === true;
    case "word-bank":
      return Array.isArray(answer) && answer.length === exercise.tokens.length;
    case "word-scramble":
      return typeof answer === "string" && answer.length === exercise.answer.length;
  }
}
