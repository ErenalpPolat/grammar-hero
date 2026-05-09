"use client";

import { LogOut, Moon, Sun, Monitor, UserCircle2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeartsIndicator } from "@/components/gamification/hearts-indicator";
import { StreakFlame } from "@/components/gamification/streak-flame";
import { GemCounter } from "@/components/gamification/gem-counter";
import { DailyGoalProgress } from "@/components/gamification/daily-goal-progress";
import { logoutAction } from "@/lib/auth-actions";
import type { SessionUser } from "@/lib/session";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

export function Topbar({ user, className }: { user: SessionUser; className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:gap-3 sm:px-6",
        className,
      )}
    >
      <Logo href="/learn" className="lg:hidden" size="sm" />
      <div className="flex-1" />
      <GamificationChips user={user} />
      <UserMenu user={user} />
    </header>
  );
}

function GamificationChips({ user }: { user: SessionUser }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <StreakFlame count={user.currentStreak} />
      <GemCounter count={user.gems} className="hidden sm:inline-flex" />
      <span className="inline-flex items-center rounded-pill bg-muted px-2.5 py-1">
        <HeartsIndicator hearts={user.hearts} />
      </span>
      <DailyGoalProgress
        minutes={user.dailyMinutes}
        goal={user.dailyGoalMinutes}
        className="hidden sm:inline-flex"
      />
    </div>
  );
}

function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction();
        toast.success("Çıkış yapıldı. Tekrar bekleriz! 👋");
        router.push("/");
        router.refresh();
      } catch (err) {
        console.error("[logout]", err);
        toast.error("Çıkış yapılamadı");
      }
    });
  };

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="Kullanıcı menüsü">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initial}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {user.name} · Lv.{user.currentLevel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile">
            <UserCircle2 className="mr-2 size-4" /> Profil
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/profile/settings">
            <Settings className="mr-2 size-4" /> Ayarlar
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Tema
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="mr-2 size-4" /> Açık
          {theme === "light" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" /> Koyu
          {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor className="mr-2 size-4" /> Sistem
          {theme === "system" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          disabled={pending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" /> {pending ? "Çıkış yapılıyor..." : "Çıkış"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
