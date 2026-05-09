import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Hand,
  Layers,
  Lock,
  MessageCircle,
  Search,
  Shuffle,
  SquarePen,
  TextCursorInput,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { availableGameTypes } from "@/data/questions";
import { GAME_TYPE_LABELS, type GameType } from "@/lib/exercise/types";
import { MOCK_UNITS } from "@/lib/learn/mock-data";
import { findLessonWithProgress } from "@/lib/learn/progress";
import { requireSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return MOCK_UNITS.flatMap((u) => u.lessons.map((l) => ({ lessonId: l.id })));
}

type GameMeta = {
  type: GameType;
  icon: typeof SquarePen;
  questionCount: string;
};

const GAME_META: Record<GameType, GameMeta> = {
  "multiple-choice": { type: "multiple-choice", icon: SquarePen, questionCount: "soru bankası" },
  "fill-in-blank": { type: "fill-in-blank", icon: MessageCircle, questionCount: "boşluk doldur" },
  "true-false": { type: "true-false", icon: ToggleRight, questionCount: "doğru / yanlış" },
  "word-bank": { type: "word-bank", icon: Shuffle, questionCount: "cümle kur" },
  "word-scramble": { type: "word-scramble", icon: TextCursorInput, questionCount: "kelime bul" },
  "find-mistake": { type: "find-mistake", icon: Search, questionCount: "hatayı bul" },
  "drag-drop": { type: "drag-drop", icon: Hand, questionCount: "sürükle-bırak" },
  "memory-match": { type: "memory-match", icon: Layers, questionCount: "eşleştir" },
};

const GAME_ORDER: GameType[] = [
  "multiple-choice",
  "fill-in-blank",
  "true-false",
  "word-bank",
  "word-scramble",
  "find-mistake",
  "drag-drop",
  "memory-match",
];

export default async function LessonDetailPage(props: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await props.params;
  const user = await requireSessionUser();
  const ref = await findLessonWithProgress(user.id, lessonId, user.level);
  if (!ref) notFound();
  const { unit, lesson } = ref;

  if (lesson.status === "locked") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
        <Link
          href={`/learn/${unit.slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {unit.title}
        </Link>
        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
          <Lock className="mx-auto mb-3 size-10 text-muted-foreground" />
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bu ders henüz kilitli. Önceki dersleri tamamla.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/learn/${unit.slug}`}>Üniteye dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  const playable = new Set<GameType>(availableGameTypes(lessonId));

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6">
      <Link
        href={`/learn/${unit.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {unit.title}
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {unit.title} · {unit.difficulty}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-lg text-muted-foreground">{lesson.description}</p>
        )}
        {lesson.status === "completed" && lesson.bestScore != null && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-pill bg-correct/10 px-3 py-1 text-sm font-semibold text-correct">
            <CheckCircle2 className="size-4" /> Tamamlandı · En iyi skor %{lesson.bestScore}
          </p>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="size-5" /> Konu Anlatımı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <LessonContent lessonId={lesson.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="games-heading">
        <h2 id="games-heading" className="mb-3 text-lg font-semibold">
          🎮 Oyun Seç
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GAME_ORDER.map((gameType) => (
            <GameCard
              key={gameType}
              lessonId={lessonId}
              gameType={gameType}
              playable={playable.has(gameType)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function GameCard({
  lessonId,
  gameType,
  playable,
}: {
  lessonId: string;
  gameType: GameType;
  playable: boolean;
}) {
  const meta = GAME_META[gameType];
  const label = GAME_TYPE_LABELS[gameType];
  const Icon = meta.icon;

  const inner = (
    <div
      className={cn(
        "flex h-full flex-col items-start gap-2 rounded-xl border-2 p-4 transition-all",
        playable
          ? "border-border bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
          : "border-dashed border-border bg-muted/20 opacity-75",
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-lg",
          playable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {meta.questionCount}
        </p>
      </div>
      <p
        className={cn(
          "text-xs font-semibold",
          playable ? "text-primary" : "text-muted-foreground",
        )}
      >
        {playable ? (
          <span className="inline-flex items-center gap-1">
            Başla <ArrowRight className="size-3" />
          </span>
        ) : (
          "Yakında"
        )}
      </p>
    </div>
  );

  if (!playable) {
    return <div aria-disabled>{inner}</div>;
  }

  return (
    <Link
      href={`/lesson/${lessonId}/quiz/${gameType}`}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-xl"
      aria-label={`${label} oyununa başla`}
    >
      {inner}
    </Link>
  );
}

function LessonContent({ lessonId }: { lessonId: string }) {
  switch (lessonId) {
    case "ps-1":
      return (
        <>
          <p>
            <strong>Present Simple</strong> · olumlu cümle: alışkanlıklar, genel doğrular ve
            tarifeli olayları anlatır. Cümlenin temel yapısı:
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Özne + Fiil (yalın) + Geri kalan
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>I / You / We / They</strong> → fiil yalın kalır
              <br />
              <code className="rounded bg-muted px-1">I play football every day.</code>
            </li>
            <li>
              <strong>He / She / It</strong> → fiile <strong>-s/-es</strong> eklenir (Faz 4&apos;te göreceğiz)
              <br />
              <code className="rounded bg-muted px-1">She plays the piano.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Sık kullanılan zaman zarfları: <em>every day, always, often, sometimes, never</em>.
          </p>
        </>
      );
    case "ps-2":
      return (
        <>
          <p>
            <strong>Present Simple</strong> · olumsuz cümle yardımcı fiil ile kurulur:
            <strong> do not (don&apos;t)</strong> veya <strong>does not (doesn&apos;t)</strong>.
            Yardımcı fiilden sonra ana fiil <em>yalın</em> kalır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            I / You / We / They + don&apos;t + Fiil
            <br />
            He / She / It + doesn&apos;t + Fiil
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">I don&apos;t like coffee.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">She doesn&apos;t play tennis.</code> (
              <em>plays</em> değil — doesn&apos;t&apos;ten sonra yalın)
            </li>
            <li>
              <code className="rounded bg-muted px-1">They don&apos;t work on weekends.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ Sık yapılan hata: <em>&quot;She doesn&apos;t plays&quot;</em> ✗ →{" "}
            <em>&quot;She doesn&apos;t play&quot;</em> ✓
          </p>
        </>
      );
    case "ps-3":
      return (
        <>
          <p>
            <strong>Present Simple</strong> · soru cümlesi yardımcı fiil <strong>do</strong> veya{" "}
            <strong>does</strong> ile başlar. Ana fiil <em>yalın</em> kalır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Do + I / you / we / they + Fiil + ... ?
            <br />
            Does + he / she / it + Fiil + ... ?
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">Do you like pizza?</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">Does she speak English?</code> (
              <em>speaks</em> değil)
            </li>
            <li>
              <code className="rounded bg-muted px-1">Do they live in Istanbul?</code>
            </li>
          </ul>
          <p>
            <strong>Kısa cevap:</strong> yardımcı fiili tekrarlarız.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            &quot;Do you like coffee?&quot; → &quot;Yes, I do.&quot; / &quot;No, I don&apos;t.&quot;
          </p>
        </>
      );
    case "ps-4":
      return (
        <>
          <p>
            <strong>Present Simple</strong>&apos;da 3. tekil şahıs (he / she / it) özneler için fiile{" "}
            <strong>-s</strong> veya <strong>-es</strong> eklenir.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Normal fiiller: <code className="rounded bg-muted px-1">play → plays</code>
            </li>
            <li>
              -s, -x, -ch, -sh, -o ile bitenler:{" "}
              <code className="rounded bg-muted px-1">go → goes</code>,{" "}
              <code className="rounded bg-muted px-1">watch → watches</code>
            </li>
            <li>
              Sessiz + -y: y &rarr; i + es:{" "}
              <code className="rounded bg-muted px-1">study → studies</code>
            </li>
          </ul>
          <p>
            Soru ve olumsuz cümlede yardımcı fiil <strong>does</strong> kullanılır; bu durumda
            ana fiil <em>yalın</em> kalır:
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Does she <strong>play</strong>? · She doesn&apos;t <strong>play</strong>.
          </p>
        </>
      );
    case "ps-5":
      return (
        <>
          <p>
            Bazı sık kullanılan fiillerin <strong>3. tekil şahıs</strong> halleri özel
            kurallarla şekillenir. Bu dersin kalbi: <strong>have</strong> ve{" "}
            <strong>do</strong>.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            have → has · do → does · go → goes · make → makes · take → takes · get → gets
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">She has a brother.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">He does his homework.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">It gets cold in winter.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ Tarifeli olaylar için Present Simple kullanılır:{" "}
            <em>&quot;The bus leaves at 9 AM.&quot;</em>
          </p>
        </>
      );
    case "ps-6":
      return (
        <>
          <p>
            🏆 <strong>Ünite Sınavı</strong> — Şimdiki Zaman ünitesinin özeti. Olumlu/olumsuz/soru
            yapıları, 3. tekil şahıs kuralı ve sık kullanılan fiiller karışık olarak gelecek.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Özne + fiil (yalın veya -s) yapısı</li>
            <li>don&apos;t / doesn&apos;t ile olumsuzluk</li>
            <li>Do / Does ile soru</li>
            <li>have/has, do/does, go/goes gibi sık fiiller</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            🎯 60% ve üstü skor → ünite tamamlanır. Bir sonraki ünite (Geçmiş Zaman) açılır.
          </p>
        </>
      );
    case "past-1":
      return (
        <>
          <p>
            <strong>Past Simple</strong> · düzenli fiiller fiilin sonuna <strong>-ed</strong>{" "}
            eklenerek yapılır. Geçmişte tamamlanmış olayları anlatır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Özne + Fiil-ed + ... + (zaman belirteci)
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Düz: <code className="rounded bg-muted px-1">work → worked</code>,{" "}
              <code className="rounded bg-muted px-1">play → played</code>
            </li>
            <li>
              -e ile biten: <code className="rounded bg-muted px-1">live → lived</code>,{" "}
              <code className="rounded bg-muted px-1">dance → danced</code>
            </li>
            <li>
              Sessiz + -y → y düşer + ied:{" "}
              <code className="rounded bg-muted px-1">study → studied</code>
            </li>
            <li>
              CVC (sessiz-sesli-sessiz) → son sessiz çiftlenir:{" "}
              <code className="rounded bg-muted px-1">stop → stopped</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Sık zaman belirteçleri: <em>yesterday, last week, two days ago</em>.
          </p>
        </>
      );
    case "past-2":
      return (
        <>
          <p>
            <strong>Past Simple</strong> · düzensiz fiiller -ed almaz, kendine has bir geçmiş
            hali vardır. <strong>Ezberlenmesi</strong> gereken yaklaşık 100 fiil var.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            go → went · see → saw · eat → ate · drink → drank · buy → bought
            <br />
            have → had · do → did · make → made · take → took · get → got
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">I went to school.</code> (go değil!)
            </li>
            <li>
              <code className="rounded bg-muted px-1">She saw the movie.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">We ate pizza.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ İlginç: <strong>read</strong>&apos;in geçmiş hali yine <strong>read</strong> ama
            telaffuzu &quot;red&quot; olur.
          </p>
        </>
      );
    case "past-3":
      return (
        <>
          <p>
            <strong>Past Simple</strong> · olumsuz cümle yardımcı fiil{" "}
            <strong>did not (didn&apos;t)</strong> ile kurulur. Tüm öznelerle aynıdır.
            Yardımcı fiilden sonra ana fiil <em>yalın</em> kalır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Özne (her şey) + didn&apos;t + Fiil (yalın) + ...
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">I didn&apos;t go to the party.</code> (
              went değil)
            </li>
            <li>
              <code className="rounded bg-muted px-1">She didn&apos;t eat breakfast.</code> (
              ate değil)
            </li>
            <li>
              <code className="rounded bg-muted px-1">They didn&apos;t finish the project.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ Past Simple öğrenirken sık yapılan hata:{" "}
            <em>&quot;She didn&apos;t went&quot;</em> ✗ →{" "}
            <em>&quot;She didn&apos;t go&quot;</em> ✓ (didn&apos;t zaten geçmişi belirtir)
          </p>
        </>
      );
    case "past-4":
      return (
        <>
          <p>
            <strong>Past Simple</strong> · soru cümlesi <strong>Did</strong> ile başlar. Ana
            fiil yine <em>yalın</em> kalır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Did + Özne + Fiil (yalın) + ... ?
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">Did you go to school?</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">Did she eat dinner?</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">Did they win the match?</code>
            </li>
          </ul>
          <p>
            <strong>Kısa cevap:</strong> yardımcı fiil tekrarlanır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            &quot;Did you like the movie?&quot; → &quot;Yes, I did.&quot; / &quot;No, I didn&apos;t.&quot;
          </p>
        </>
      );
    case "past-5":
      return (
        <>
          <p>
            <strong>Past Simple</strong> ile sık kullanılan zaman belirteçleri cümlenin{" "}
            <em>başında veya sonunda</em> yer alır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            yesterday · last (week / month / year / Friday)
            <br />
            (süre) ago · in (yıl) · this morning · then
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">I saw him yesterday.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">She moved here three years ago.</code>{" "}
              (süre + ago)
            </li>
            <li>
              <code className="rounded bg-muted px-1">He was born in 1990.</code> (yıl → in)
            </li>
            <li>
              <code className="rounded bg-muted px-1">We met last summer.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ <strong>tomorrow</strong>, <strong>next week</strong> gibi belirteçler Past Simple
            ile <em>kullanılmaz</em> (gelecek zamana aittir).
          </p>
        </>
      );
    case "past-6":
      return (
        <>
          <p>
            🏆 <strong>Ünite Sınavı</strong> — Geçmiş Zaman ünitesinin özeti. Düzenli/düzensiz
            fiiller, didn&apos;t/Did yapıları ve zaman belirteçleri karışık olarak gelecek.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Düzenli fiiller: -ed (worked, studied, stopped)</li>
            <li>Düzensiz fiiller: went, ate, saw, bought…</li>
            <li>didn&apos;t + yalın fiil olumsuz yapı</li>
            <li>Did + özne + yalın fiil soru yapısı</li>
            <li>Zaman belirteçleri (yesterday, ago, in 1990)</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            🎯 60% ve üstü skor → ünite tamamlanır. Sonraki ünite açılır.
          </p>
        </>
      );
    case "pc-1":
      return (
        <>
          <p>
            <strong>Present Continuous</strong> · şu anda olmakta olan eylemleri anlatır.
            Yapı: <strong>am/is/are + fiil + -ing</strong>.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            I + am + V-ing
            <br />
            He / She / It + is + V-ing
            <br />
            We / You / They + are + V-ing
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">I am playing football right now.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">She is reading a book.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">They are watching TV.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ Sık yapılan hata: <em>&quot;She is play&quot;</em> ✗ →{" "}
            <em>&quot;She is playing&quot;</em> ✓
          </p>
        </>
      );
    case "pc-2":
      return (
        <>
          <p>
            <strong>Present Continuous</strong> · olumsuz cümle <strong>not</strong> ekleyerek
            yapılır. Yardımcı fiil aynı kalır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            I am <strong>not</strong> + V-ing
            <br />
            He isn&apos;t + V-ing · They aren&apos;t + V-ing
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">I am not working today.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">She isn&apos;t sleeping.</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">They aren&apos;t playing tennis.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ &quot;I amn&apos;t&quot; YOK — sadece <strong>I am not</strong> veya{" "}
            <strong>I&apos;m not</strong>.
          </p>
        </>
      );
    case "pc-3":
      return (
        <>
          <p>
            <strong>Present Continuous</strong> · soru cümlesinde yardımcı fiil özneyle yer
            değiştirir.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            Am + I + V-ing ?
            <br />
            Is + he/she/it + V-ing ?
            <br />
            Are + you/we/they + V-ing ?
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-muted px-1">Are you listening to me?</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1">Is she reading a book?</code>
            </li>
          </ul>
          <p>
            <strong>Kısa cevap:</strong> yardımcı fiil tekrarlanır.
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            &quot;Are you studying?&quot; → &quot;Yes, I am.&quot; / &quot;No, I&apos;m not.&quot;
          </p>
        </>
      );
    case "pc-4":
      return (
        <>
          <p>
            Fiile <strong>-ing</strong> eklerken bazı yazım kuralları vardır:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Düz: <code className="rounded bg-muted px-1">play → playing</code>
            </li>
            <li>
              Sonu -e: e düşer:{" "}
              <code className="rounded bg-muted px-1">make → making</code>,{" "}
              <code className="rounded bg-muted px-1">write → writing</code>
            </li>
            <li>
              CVC (sessiz-sesli-sessiz, son sessiz çiftlenir):{" "}
              <code className="rounded bg-muted px-1">run → running</code>,{" "}
              <code className="rounded bg-muted px-1">swim → swimming</code>
            </li>
            <li>
              Sonu -ie: ie → y + ing:{" "}
              <code className="rounded bg-muted px-1">lie → lying</code>,{" "}
              <code className="rounded bg-muted px-1">die → dying</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ <em>writting ✗</em> → <em>writing ✓</em> (e düşünce çift t olmaz)
          </p>
        </>
      );
    case "pc-5":
      return (
        <>
          <p>
            <strong>Present Continuous</strong> ile sık kullanılan zaman belirteçleri:
          </p>
          <p className="rounded bg-muted p-3 font-mono text-xs">
            now · right now · at the moment · currently
            <br />
            today · this week / month · these days · nowadays
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Şu an: <code className="rounded bg-muted px-1">I am working right now.</code>
            </li>
            <li>
              Geçici dönem:{" "}
              <code className="rounded bg-muted px-1">She is studying for her exams these days.</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            ⚠ <em>every day, often, always</em> → <strong>Present Simple</strong> (alışkanlık),
            Present Continuous değil.
          </p>
        </>
      );
    case "pc-6":
      return (
        <>
          <p>
            🏆 <strong>Ünite Sınavı</strong> — Şimdiki Sürekli Zaman özeti. am/is/are seçimi,
            -ing yazım kuralları, olumsuz/soru yapıları ve zaman belirteçleri karışık olarak
            gelecek.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>am/is/are + V-ing yapısı</li>
            <li>-ing yazım kuralları (running, writing, lying)</li>
            <li>am not / isn&apos;t / aren&apos;t olumsuz</li>
            <li>Am/Is/Are ile soru</li>
            <li>now, at the moment, these days zaman belirteçleri</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            🎯 60% ve üstü skor → ünite tamamlanır.
          </p>
        </>
      );
    default:
      return (
        <p className="text-muted-foreground">
          (Bu ders için tam içerik henüz hazır değil — seed sonraki sürümde gelecek.)
        </p>
      );
  }
}
