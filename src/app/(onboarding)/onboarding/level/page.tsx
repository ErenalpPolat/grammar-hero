"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { ChoiceCard } from "@/components/onboarding/choice-card";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { setLevelAction } from "../actions";

const LEVELS = [
  { value: "newbie", label: "Tamamen yeniyim", description: "Henüz hiç öğrenmedim", emoji: "🌱" },
  { value: "a1-a2", label: "A1-A2 · Başlangıç", description: "Basit cümleler kurabiliyorum", emoji: "📘" },
  { value: "b1-b2", label: "B1-B2 · Orta", description: "Günlük konuşmaları anlıyorum", emoji: "💬" },
  { value: "c1-plus", label: "C1+ · İleri", description: "Akademik metinleri okuyorum", emoji: "🎓" },
];

export default function OnboardingLevelPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("level", selected);
      await setLevelAction(fd);
    });
  }

  return (
    <div>
      <StepIndicator current={2} total={3} />
      <h1 className="mb-6 text-center text-3xl font-bold">Şu anki seviyen nedir?</h1>
      <div className="flex flex-col gap-3">
        {LEVELS.map((lvl) => (
          <ChoiceCard
            key={lvl.value}
            value={lvl.value}
            label={lvl.label}
            description={lvl.description}
            leading={lvl.emoji}
            selected={selected === lvl.value}
            onSelect={setSelected}
            layout="row"
            disabled={pending}
          />
        ))}
      </div>
      <Button
        type="button"
        size="xl"
        className="mt-8 w-full"
        onClick={handleSubmit}
        disabled={!selected}
        loading={pending}
      >
        Devam <ArrowRight />
      </Button>
    </div>
  );
}
