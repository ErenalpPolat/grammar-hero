import Link from "next/link";
import { ArrowRight, Code2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Hakkında" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="text-center">
        <p className="text-6xl" aria-hidden>
          🦉
        </p>
        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Hakkında</h1>
      </header>

      <section className="mt-12 space-y-4 text-base leading-relaxed">
        <p>
          <strong>Grammar Hero</strong>, dilbilgisi öğrenmeyi <em>oyun gibi</em> yapan açık,
          ücretsiz ve reklamsız bir web uygulamasıdır. Duolingo&apos;nun motivasyon
          mekaniklerini İngilizce gramerine odaklanmış bir öğrenme deneyimi ile birleştirir.
        </p>
        <p>
          Bu proje aynı zamanda bir <strong>portfolyo çalışması</strong>: Next.js 16, React 19,
          Tailwind v4, Prisma 7, NextAuth v5 ve modern web ekosisteminin diğer parçalarıyla
          inşa edildi. Kod açık — gör, dene, kendi versiyonunu yap.
        </p>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-2xl font-bold">Felsefe</h2>
        <ul className="list-inside list-disc space-y-2 text-sm">
          <li>
            <strong>Tutarlılık &gt; yoğunluk.</strong> Günde 5 dakika, 7 günde fark — saatlerce
            tek seferde değil.
          </li>
          <li>
            <strong>Hatadan öğren, ceza yok.</strong> Yanlış cevapta kısa açıklama + sonraki
            soruya geç. Kötü hissettirmek motivasyonu öldürür.
          </li>
          <li>
            <strong>Tek doğru yol yok.</strong> Aynı konuyu 8 farklı oyun tipiyle gör — sana
            uygun olanı bul.
          </li>
          <li>
            <strong>Açık ve şeffaf.</strong> Reklam yok, veri satılmaz, kaynak kod açık.
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-2xl font-bold">İletişim</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" aria-hidden />
            <a href="mailto:polaere06@gmail.com" className="text-primary hover:underline">
              polaere06@gmail.com
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Code2 className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">GitHub repo (yakında)</span>
          </li>
        </ul>
      </section>

      <div className="mt-16 text-center">
        <Button asChild size="xl">
          <Link href="/register">
            Hadi başla <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
