import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Flame,
  Heart,
  Layers,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Özellikler" };

const FEATURES = [
  {
    icon: Target,
    title: "Skill tree ile odaklı pratik",
    desc: "Şimdiki Zaman → Geçmiş Zaman → Şimdiki Sürekli — her ünite önceki üzerine inşa edilir. Atlamak yerine sırayla ilerlersin.",
  },
  {
    icon: Layers,
    title: "8 farklı oyun tipi",
    desc: "Çoktan Seçmeli, Fill-in-Blank, True/False, Cümle Kur, Kelime Bul, Hatayı Bul, Sürükle-Bırak, Eşleştir. Her ders aynı konuyu farklı açılardan öğretir.",
  },
  {
    icon: Flame,
    title: "Streak motivasyonu",
    desc: "Her gün ders yap, zincirini kırma. 7+ günde alev daha sıcak yanar. Kaybedersen StreakBroken modal'ı seni motive eder.",
  },
  {
    icon: Heart,
    title: "Hatadan öğren, baskı yok",
    desc: "Yanlış cevapta nazik bir feedback paneli kayar — doğru cevap + kısa açıklama. Yanlış sayısı nasılsın seni etiketlemez.",
  },
  {
    icon: BarChart3,
    title: "Aktivite heatmap",
    desc: "GitHub-style 6 aylık takvim profil sayfanda. Hangi günler aktif olduğunu görür, alışkanlık geliştirirsin.",
  },
  {
    icon: Trophy,
    title: "Liderlik ve rozetler",
    desc: "Haftalık + aylık + tüm zamanlar liderlik tablosu. Sıralamada yükselmek için XP topla. 8 rozet açmaya çalış.",
  },
  {
    icon: Brain,
    title: "Spaced repetition tekrar",
    desc: "Yanlış yaptığın kavramlar tekrar havuzuna düşer. Beyin onları unutmadan önce karşına çıkar.",
  },
  {
    icon: Zap,
    title: "Klavye + mobil uyumlu",
    desc: "1-4 tuşlarıyla şık seç, Enter ile onayla. Mobilde tap-to-add. Hangi cihazdan girersen gir akıcı.",
  },
  {
    icon: Sparkles,
    title: "Karanlık mod + a11y",
    desc: "Açık/koyu/sistem teması. WCAG AA kontrastı, klavye navigasyonu, prefers-reduced-motion uyumu.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Özellikler</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Grammar Hero, dilbilgisi öğrenmeyi sürdürülebilir bir alışkanlığa dönüştürmek için
          tasarlandı. İşte sevdiğin parçalar:
        </p>
      </header>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <li
            key={f.title}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <f.icon className="mb-4 size-8 text-primary" aria-hidden />
            <h2 className="mb-2 text-lg font-semibold">{f.title}</h2>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </li>
        ))}
      </ul>

      <div className="mt-16 text-center">
        <Button asChild size="xl">
          <Link href="/register">
            Ücretsiz Başla <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
