import { SkillTree } from "@/components/learn/skill-tree";
import { getUnitsWithProgress } from "@/lib/learn/progress";
import { requireSessionUser } from "@/lib/session";

export const metadata = { title: "Öğren" };

export default async function LearnPage() {
  const user = await requireSessionUser();
  const units = await getUnitsWithProgress(user.id, user.level);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Öğren</h1>
        <p className="mt-1 text-muted-foreground">
          Skill tree · dersleri sırayla aç, streak&apos;ini koru.
        </p>
      </header>
      <SkillTree units={units} />
    </div>
  );
}
