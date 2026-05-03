import { CalendarRange, Settings, Trophy } from "lucide-react";
import Link from "next/link";
import { ActivityHeatmap } from "@/components/profile/activity-heatmap";
import { BadgeGrid } from "@/components/profile/badge-grid";
import { ProfileStats } from "@/components/profile/profile-stats";
import { XPRing } from "@/components/gamification/xp-ring";
import { Button } from "@/components/ui/button";
import { getActivityMap, getProfileSummary } from "@/lib/activity";
import { formatDate } from "@/lib/date";
import { mockBadges } from "@/lib/mock/profile-data";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

const LEVEL_LABEL: Record<string, string> = {
  newbie: "Tamamen yeni",
  "a1-a2": "A1-A2 · Başlangıç",
  "b1-b2": "B1-B2 · Orta",
  "c1-plus": "C1+ · İleri",
};

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireSessionUser();
  const [full, summary, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true, longestStreak: true },
    }),
    getProfileSummary(user.id),
    getActivityMap(user.id, 180),
  ]);

  const badges = mockBadges({
    lessonsCompleted: summary.lessonsCompleted,
    longestStreak: full?.longestStreak ?? user.currentStreak,
  });
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <XPRing
            currentXp={user.totalXp % 1000}
            xpToNext={1000}
            level={user.currentLevel}
            size={80}
            strokeWidth={6}
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarRange className="size-3.5" />
              {full?.createdAt
                ? `${formatDate(full.createdAt)} tarihinden beri üye`
                : "Yeni üye"}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link href="/profile/settings">
            <Settings /> Ayarlar
          </Link>
        </Button>
      </header>

      {/* Stats */}
      <ProfileStats
        streak={user.currentStreak}
        longestStreak={full?.longestStreak ?? user.currentStreak}
        gems={user.gems}
        lessonsCompleted={summary.lessonsCompleted}
        badgesEarned={earnedCount}
        badgesTotal={badges.length}
      />

      {/* Activity heatmap */}
      <section aria-labelledby="heatmap-title">
        <h2 id="heatmap-title" className="mb-3 text-lg font-semibold">
          📅 Aktivite Takvimi — son 6 ay
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <ActivityHeatmap activity={activity} months={6} />
        </div>
      </section>

      {/* Badges */}
      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Trophy className="size-5 text-xp" /> Rozetler
          <span className="text-sm font-normal text-muted-foreground">
            ({earnedCount}/{badges.length})
          </span>
        </h2>
        <BadgeGrid badges={badges} />
      </section>

      {/* Detailed stats */}
      <section aria-labelledby="detail-title" className="space-y-2">
        <h2 id="detail-title" className="text-lg font-semibold">
          Detaylı İstatistik
        </h2>
        <dl className="divide-y divide-border rounded-xl border border-border bg-card text-sm">
          <DLRow label="En uzun streak" value={`${full?.longestStreak ?? user.currentStreak} gün`} />
          <DLRow label="Toplam oyun" value={String(summary.totalAttempts)} />
          <DLRow label="Toplam zaman" value={formatMinutes(summary.totalMinutes)} />
          <DLRow
            label="Başlangıç seviyesi"
            value={user.level ? LEVEL_LABEL[user.level] : "—"}
          />
          <DLRow label="Günlük hedef" value={`${user.dailyGoalMinutes} dakika`} />
          <DLRow label="Toplam XP" value={user.totalXp.toLocaleString("tr")} />
        </dl>
      </section>
    </div>
  );
}

function DLRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function formatMinutes(total: number): string {
  if (total < 60) return `${total} dk`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}
