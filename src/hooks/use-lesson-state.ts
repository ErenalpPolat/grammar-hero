"use client";

import { useCallback, useMemo, useReducer } from "react";
import { grade, type GradeResult } from "@/lib/exercise/grader";
import type { Exercise, LessonQuiz } from "@/lib/exercise/types";
import { computeXp, type XpSummary } from "@/lib/exercise/xp";

export type LessonPhase = "answering" | "feedback" | "completed" | "game-over";

interface LessonState {
  index: number;
  hearts: number;
  heartsMax: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  phase: LessonPhase;
  feedback: (GradeResult & { wasSkipped?: boolean }) | null;
  /** Current answer for the exercise at `index` — reset on advance */
  answer: unknown;
  /** Exercises the user got wrong or skipped — later sent to the SM-2 review deck. */
  wrongExercises: Exercise[];
}

type Action =
  | { type: "SET_ANSWER"; answer: unknown }
  | { type: "SUBMIT"; result: GradeResult; exercise: Exercise }
  | { type: "SKIP"; exercise: Exercise }
  | { type: "CONTINUE"; total: number }
  | { type: "RESET"; heartsMax: number };

function initialState(heartsMax: number): LessonState {
  return {
    index: 0,
    hearts: heartsMax,
    heartsMax,
    correctCount: 0,
    wrongCount: 0,
    skippedCount: 0,
    phase: "answering",
    feedback: null,
    answer: null,
    wrongExercises: [],
  };
}

function reducer(state: LessonState, action: Action): LessonState {
  switch (action.type) {
    case "SET_ANSWER": {
      if (state.phase !== "answering") return state;
      return { ...state, answer: action.answer };
    }
    case "SUBMIT": {
      if (state.phase !== "answering") return state;
      const nextHearts = action.result.correct ? state.hearts : Math.max(0, state.hearts - 1);
      return {
        ...state,
        hearts: nextHearts,
        correctCount: state.correctCount + (action.result.correct ? 1 : 0),
        wrongCount: state.wrongCount + (action.result.correct ? 0 : 1),
        wrongExercises: action.result.correct
          ? state.wrongExercises
          : [...state.wrongExercises, action.exercise],
        phase: "feedback",
        feedback: action.result,
      };
    }
    case "SKIP": {
      if (state.phase !== "answering") return state;
      return {
        ...state,
        skippedCount: state.skippedCount + 1,
        wrongCount: state.wrongCount + 1,
        wrongExercises: [...state.wrongExercises, action.exercise],
        phase: "feedback",
        feedback: { correct: false, correctAnswerLabel: "", wasSkipped: true },
      };
    }
    case "CONTINUE": {
      if (state.phase !== "feedback") return state;
      if (state.hearts <= 0) return { ...state, phase: "game-over", feedback: null, answer: null };
      const next = state.index + 1;
      if (next >= action.total) return { ...state, phase: "completed", feedback: null, answer: null };
      return { ...state, index: next, phase: "answering", feedback: null, answer: null };
    }
    case "RESET": {
      return initialState(action.heartsMax);
    }
  }
}

export function useLessonState(quiz: LessonQuiz) {
  const heartsMax = quiz.heartsMax ?? 3;
  const total = quiz.exercises.length;

  const [state, dispatch] = useReducer(reducer, heartsMax, initialState);

  const currentExercise: Exercise | null = state.index < total ? quiz.exercises[state.index] : null;

  const setAnswer = useCallback((answer: unknown) => {
    dispatch({ type: "SET_ANSWER", answer });
  }, []);

  const submit = useCallback(() => {
    if (!currentExercise) return;
    const result = grade(currentExercise, state.answer);
    dispatch({ type: "SUBMIT", result, exercise: currentExercise });
  }, [currentExercise, state.answer]);

  const skip = useCallback(() => {
    if (!currentExercise) return;
    dispatch({ type: "SKIP", exercise: currentExercise });
  }, [currentExercise]);

  const continueNext = useCallback(() => {
    dispatch({ type: "CONTINUE", total });
  }, [total]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET", heartsMax });
  }, [heartsMax]);

  const xp: XpSummary = useMemo(
    () =>
      computeXp({
        correctCount: state.correctCount,
        total,
        heartsLeft: state.hearts,
        heartsMax,
        skippedCount: state.skippedCount,
      }),
    [state.correctCount, state.hearts, heartsMax, state.skippedCount, total],
  );

  const accuracyPct = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;
  const progress =
    total > 0
      ? Math.min(
          100,
          Math.round(((state.index + (state.phase !== "answering" ? 1 : 0)) / total) * 100),
        )
      : 0;

  return {
    state,
    currentExercise,
    total,
    xp,
    accuracyPct,
    progress,
    setAnswer,
    submit,
    skip,
    continueNext,
    reset,
  };
}
