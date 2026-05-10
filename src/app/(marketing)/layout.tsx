import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/features", label: "Özellikler" },
  { href: "/pricing", label: "Fiyatlandırma" },
  { href: "/about", label: "Hakkında" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo href="/" />
          <nav
            className="hidden items-center gap-5 text-sm font-medium md:flex"
            aria-label="Marketing navigasyon"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              Giriş Yap
            </Link>
            <Button asChild size="sm">
              <Link href="/register">Ücretsiz Başla</Link>
            </Button>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1 pt-16">
        {children}
      </main>
      <footer className="border-t border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
          <p>© 2026 Grammar Hero</p>
          <nav className="flex flex-wrap items-center gap-4 text-xs" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
            <Link href="/login" className="hover:text-foreground">
              Giriş
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
