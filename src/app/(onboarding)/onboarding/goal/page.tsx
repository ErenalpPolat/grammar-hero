"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import { ChoiceCard } from "@/components/onboarding/choice-card";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { setGoalAction } from "../actions";

const GOALS = [
  { value: 5, label: "5 dk · Rahat", emoji: "☕" },
  { value: 10, label: "10 dk · Normal", emoji: "📖" },
  { value: 15, label: "15 dk · Ciddi", emoji: "💪" },
  { value: 20, label: "20 dk · Hedef!", emoji: "🚀" },
];

export default function OnboardingGoalPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (selected == null) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("dailyGoalMinutes", String(selected));
      await setGoalAction(fd);
    });
  }

  return (
    <div>
      <Link
        href="/onboarding/level"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Geri
      </Link>
      <StepIndicator current={3} total={3} />
      <h1 className="mb-2 text-center text-3xl font-bold">Günlük hedefin ne olsun?</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Her gün bu kadar pratik yapmayı hedeflersin. Sonradan değiştirebilirsin.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GOALS.map((g) => (
          <ChoiceCard
            key={g.value}
            value={String(g.value)}
            label={g.label}
            leading={g.emoji}
            selected={selected === g.value}
            onSelect={(v) => setSelected(Number(v))}
            disabled={pending}
          />
        ))}
      </div>
      <Button
        type="button"
        size="xl"
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={selected == null}
        loading={pending}
      >
        Hadi başlayalım <Rocket />
      </Button>
    </div>
  );
}
