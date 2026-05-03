"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLearningPrefsAction } from "@/app/(app)/profile/settings/actions";

const LEVELS = [
  { value: "newbie", label: "Tamamen yeni" },
  { value: "a1-a2", label: "A1-A2 Başlangıç" },
  { value: "b1-b2", label: "B1-B2 Orta" },
  { value: "c1-plus", label: "C1+ İleri" },
];

const GOALS = [5, 10, 15, 20];

export function LearningPrefsForm({
  initialLevel,
  initialGoal,
}: {
  initialLevel: string | null;
  initialGoal: number;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateLearningPrefsAction(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Tercihler güncellendi");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="settings-level">Seviye</Label>
        <Select name="level" defaultValue={initialLevel ?? "newbie"}>
          <SelectTrigger id="settings-level">
            <SelectValue placeholder="Seviye seç" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Günlük hedef</Label>
        <RadioGroup
          name="dailyGoalMinutes"
          defaultValue={String(initialGoal)}
          className="grid grid-cols-4 gap-2"
        >
          {GOALS.map((g) => (
            <label
              key={g}
              htmlFor={`goal-${g}`}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm font-medium has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem id={`goal-${g}`} value={String(g)} />
              {g} dk
            </label>
          ))}
        </RadioGroup>
      </div>

      <Button type="submit" loading={pending}>
        <Check /> Kaydet
      </Button>
    </form>
  );
}
