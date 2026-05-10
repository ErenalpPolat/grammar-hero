import Link from "next/link";
import { ArrowLeft, BookOpen, AlertTriangle, Bell, Palette, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountButton } from "@/components/profile/delete-account-button";
import { LearningPrefsForm } from "@/components/profile/learning-prefs-form";
import { NameEditForm } from "@/components/profile/name-edit-form";
import { NotificationsSettings } from "@/components/profile/notifications-settings";
import { ThemeSettings } from "@/components/profile/theme-settings";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

export const metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const user = await requireSessionUser({ allowIncompleteOnboarding: true });
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { createdAt: true, email: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Profil
      </Link>

      <h1 className="text-3xl font-bold">⚙ Ayarlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User2 className="size-4" /> Hesap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <NameEditForm initialName={user.name} />
          <dl className="divide-y divide-border border-t border-border pt-3">
            <DLRow label="E-posta" value={full?.email ?? "—"} />
            <DLRow
              label="Üyelik"
              value={full?.createdAt ? formatDate(full.createdAt) : "—"}
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4" /> Öğrenme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LearningPrefsForm
            initialLevel={user.level}
            initialGoal={user.dailyGoalMinutes}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" /> Görünüm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Tema</p>
            <ThemeSettings />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4" /> Bildirim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationsSettings />
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="size-4" /> Tehlike Bölgesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hesabını sil — XP, streak, rozet hepsi silinir. Geri alınamaz.
          </p>
          <DeleteAccountButton userName={user.name} />
        </CardContent>
      </Card>
    </div>
  );
}

function DLRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
