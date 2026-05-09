"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setNameAction } from "../actions";

export default function OnboardingNamePage() {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  const trimmed = name.trim();
  const canSubmit = trimmed.length >= 2 && trimmed.length <= 40;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", trimmed);
      await setNameAction(fd);
    });
  }

  return (
    <div>
      <StepIndicator current={1} total={3} />
      <h1 className="mb-2 text-center text-3xl font-bold">Sana ne diyelim?</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Skill tree, profil ve liderlik tablosunda bu ad görünür.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="onboarding-name">Adın</Label>
          <Input
            id="onboarding-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Polat"
            autoComplete="given-name"
            autoFocus
            maxLength={40}
            required
          />
          <p className="text-xs text-muted-foreground">
            İstediğin zaman profil ayarlarından değiştirebilirsin.
          </p>
        </div>
        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={!canSubmit}
          loading={pending}
        >
          Devam <ArrowRight />
        </Button>
      </form>
    </div>
  );
}
