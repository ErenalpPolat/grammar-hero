import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lock, Star } from "lucide-react";
import { UnitBanner } from "@/components/learn/unit-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_UNITS } from "@/lib/learn/mock-data";
import { getUnitsWithProgress } from "@/lib/learn/progress";
import { requireSessionUser } from "@/lib/session";
import type { Lesson } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return MOCK_UNITS.map((u) => ({ unitSlug: u.slug }));
}

export default async function UnitDetailPage(props: PageProps<"/learn/[unitSlug]">) {
  const { unitSlug } = await props.params;
  const user = await requireSessionUser();
  const units = await getUnitsWithProgress(user.id, user.level);
  const unit = units.find((u) => u.slug === unitSlug);
  if (!unit) notFound();

  const regularLessons = unit.lessons.filter((l) => !l.isUnitExam);
  const exam = unit.lessons.find((l) => l.isUnitExam);
  const allDone = regularLessons.every((l) => l.status === "completed");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Skill tree
      </Link>

      <UnitBanner unit={unit} variant="detail" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📖 Ünite Rehberi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{unit.description}</p>
          <p className="text-xs italic">(Tam rehber içeriği Faz 6&apos;da gelecek)</p>
        </CardContent>
      </Card>

      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="mb-3 text-lg font-semibold">
          Dersler
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {regularLessons.map((l, i) => (
            <LessonRow key={l.id} lesson={l} index={i + 1} />
          ))}
        </ul>
      </section>

      {exam && (
        <Card
          className={cn(
            "border-xp/40 bg-xp/5",
            !allDone && "opacity-60",
          )}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full",
                allDone ? "bg-xp text-white" : "bg-muted text-muted-foreground",
              )}
            >
              🏆
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">🏆 Ünite Sınavı</p>
              <p className="text-sm text-muted-foreground">
                {allDone
                  ? "Tüm dersleri tamamladın — sınavla ünitiyi pekiştir."
                  : `${regularLessons.filter((l) => l.status === "completed").length}/${regularLessons.length} ders tamamlandığında açılır.`}
              </p>
            </div>
            {allDone ? (
              <Button asChild>
                <Link href={`/lesson/${exam.id}`}>
                  Sınava Başla <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button disabled variant="outline">
                <Lock /> Kilitli
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const { status, bestScore } = lesson;
  const statusIcon =
    status === "completed" ? (
      <Check className="size-5 text-correct" aria-hidden />
    ) : status === "available" ? (
      <span aria-hidden className="text-primary">▶</span>
    ) : (
      <Lock className="size-4 text-muted-foreground" aria-hidden />
    );

  const row = (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          status === "completed" && "bg-correct/10",
          status === "available" && "bg-primary/10",
          status === "locked" && "bg-muted",
        )}
      >
        {statusIcon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">
          {index}. {lesson.title}
        </span>
        {lesson.description && (
          <span className="block truncate text-xs text-muted-foreground">{lesson.description}</span>
        )}
      </span>
      {status === "completed" && bestScore != null && (
        <span className="flex items-center gap-1 text-xs font-semibold text-xp">
          <Star className="size-3 fill-current" /> {bestScore}%
        </span>
      )}
      {status === "available" && (
        <span className="text-xs font-semibold text-primary">Başla →</span>
      )}
    </>
  );

  if (status === "locked") {
    return (
      <li className="flex items-center gap-3 p-4 text-muted-foreground">{row}</li>
    );
  }
  return (
    <li>
      <Link
        href={`/lesson/${lesson.id}`}
        className="flex items-center gap-3 p-4 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
      >
        {row}
      </Link>
    </li>
  );
}
