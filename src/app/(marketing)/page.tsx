import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Flame,
  Heart,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-pill bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Ücretsiz · Reklamsız · Türkçe arayüz
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Dilbilgisi öğren,
            <br />
            oyun gibi keyif al.
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Duolingo tarzı oyunlaştırılmış egzersizler, streak sistemi ve spaced repetition
            ile günde 5 dakikada İngilizce gramerini sağlamlaştır.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl">
              <Link href="/login">
                Ücretsiz Başla <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="#nasil-calisir">Nasıl çalışır?</Link>
            </Button>
          </div>
        </div>
        <div
          aria-hidden
          className="relative flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-violet-300/20 to-xp/20 p-12"
        >
          <span className="text-[12rem] leading-none drop-shadow-xl">🦉</span>
          <div className="absolute left-4 top-4 rounded-pill bg-background px-3 py-1 text-sm font-semibold shadow-card">
            🔥 12 gün streak
          </div>
          <div className="absolute bottom-4 right-4 rounded-pill bg-background px-3 py-1 text-sm font-semibold shadow-card">
            ⭐ +50 XP
          </div>
          <div className="absolute bottom-16 left-8 rounded-pill bg-background px-3 py-1 text-sm font-semibold shadow-card">
            💎 250
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-12 sm:py-20">
        <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
          Neden Grammar Hero?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Target} title="Hedefli Pratik" desc="A1'den C1'e her seviye için ayrı skill tree" />
          <Feature icon={Flame} title="Streak Motivasyon" desc="Her gün ders yap, zinciri kırma" />
          <Feature icon={Heart} title="Hatadan Öğren" desc="Nazik açıklamalar, baskı yok" />
          <Feature icon={BarChart3} title="İlerleme Takibi" desc="XP, heatmap, rozet — hep görünür" />
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="py-12 sm:py-20">
        <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">Nasıl Çalışır?</h2>
        <p className="mb-10 text-center text-muted-foreground">
          3 basit adımda başla, günde 5 dakika yeter.
        </p>
        <ol className="grid gap-4 sm:grid-cols-3">
          <Step
            step={1}
            title="Adını yaz"
            desc='"Polat" yaz, mock magic link ile giriş yap. E-posta, şifre yok.'
          />
          <Step
            step={2}
            title="Hedefini belirle"
            desc="Dil · seviye · günlük hedef (5-20 dk) seçimi ile profilini hazırla."
          />
          <Step
            step={3}
            title="Oynamaya başla"
            desc="Skill tree'den bir ders aç, 8 oyun tipinden birini seç, XP kazan."
          />
        </ol>
      </section>

      {/* Game types */}
      <section className="py-12 sm:py-20">
        <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">
          Her ders, 8 farklı oyun
        </h2>
        <p className="mb-10 text-center text-muted-foreground">
          Aynı konuyu 8 farklı şekilde öğrenirsin — ezber değil, ders.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GameTile emoji="🔘" title="Çoktan Seçmeli" desc="4 şıktan doğruyu bul" />
          <GameTile emoji="📝" title="Boşluk Doldur" desc="Cümle boşluğunu tamamla" />
          <GameTile emoji="✓✗" title="Doğru / Yanlış" desc="Cümle doğru mu yanlış mı" />
          <GameTile emoji="🧩" title="Cümle Kur" desc="Kelimeleri sıraya diz" />
          <GameTile emoji="🔤" title="Karışık Harfler" desc="Harflerden kelimeyi kur" />
          <GameTile emoji="🔍" title="Hata Bul" desc="Cümledeki yanlış kelimeyi tıkla" />
          <GameTile emoji="🎯" title="Sürükle-Bırak" desc="Doğru cevabı kutuya sürükle" />
          <GameTile emoji="🧠" title="Hafıza Eşleştirme" desc="Eşleşen kartları bul" />
        </div>
      </section>

      {/* CTA */}
      <section className="my-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-violet-500/10 p-10 text-center sm:p-16">
        <Zap className="mx-auto mb-4 size-10 text-xp" aria-hidden />
        <h2 className="text-3xl font-bold sm:text-4xl">Bugün başla, yarın fark et.</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          İlk ders 3 dakika. Hesap oluşturmadan bile deneyebilirsin (sadece adını yaz).
        </p>
        <Button asChild size="xl" className="mt-6">
          <Link href="/login">
            Ücretsiz başla <Trophy />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Target;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <Icon className="mb-4 size-8 text-primary" />
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <li className="relative rounded-lg border border-border bg-card p-6">
      <span className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
        {step}
      </span>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </li>
  );
}

function GameTile({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 text-center transition-transform hover:-translate-y-0.5">
      <div className="mb-3 text-4xl" aria-hidden>
        {emoji}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
