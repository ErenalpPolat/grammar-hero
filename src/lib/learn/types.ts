export type LessonStatus = "locked" | "available" | "completed";

export type LessonIcon =
  | "book"
  | "sun"
  | "clock"
  | "rocket"
  | "zap"
  | "sparkles"
  | "trophy"
  | "messageCircle"
  | "star"
  | "award"
  | "puzzle"
  | "layers";

export type Difficulty = "Başlangıç" | "Orta" | "İleri";

/** CEFR seviyesi — onboarding'de seçilen `level` ile filtreleme için */
export type CefrLevel = "a1" | "a2" | "b1" | "b2" | "c1";

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  status: LessonStatus;
  /** Best score 0-100 for completed lessons */
  bestScore?: number;
  /** Progress ring 0-100 (completed always 100) */
  progress?: number;
  icon?: LessonIcon;
  /** Marks the last lesson in a unit as the "sınav" (displayed differently) */
  isUnitExam?: boolean;
}

export interface Unit {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  /** CEFR seviyesi — kullanıcının seçtiği seviyeye göre unit'ler filtrelenir */
  cefrLevel: CefrLevel;
  status: LessonStatus;
  lessons: Lesson[];
}
