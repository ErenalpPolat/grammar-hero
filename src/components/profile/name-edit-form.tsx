"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateNameAction } from "@/app/(app)/profile/settings/actions";

export function NameEditForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  const trimmed = name.trim();
  const changed = trimmed !== initialName;
  const valid = trimmed.length >= 2 && trimmed.length <= 40;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!changed || !valid || pending) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", trimmed);
      const result = await updateNameAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ad güncellendi");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="settings-name">Ad</Label>
      <div className="flex items-center gap-2">
        <Input
          id="settings-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
        />
        <Button type="submit" loading={pending} disabled={!changed || !valid}>
          <Check /> Kaydet
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Profilde ve liderlik tablosunda görünür.
      </p>
    </form>
  );
}
