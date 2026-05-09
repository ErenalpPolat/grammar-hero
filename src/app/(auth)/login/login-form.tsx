"use client";

import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLinkAction } from "./actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = email.trim();
  const canSubmit = /\S+@\S+\.\S+/.test(trimmed);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || pending) return;
    startTransition(async () => {
      const result = await sendMagicLinkAction({ email: trimmed });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSentTo(trimmed);
    });
  }

  if (sentTo) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-8 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Link gönderildi!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>{sentTo}</strong> adresine giriş linki yolladık.
              <br />
              Linke tıklayınca otomatik giriş yapacaksın. 15 dakika geçerli.
            </p>
            <p className="mt-3 rounded-md border border-amber-300/40 bg-amber-50 px-3 py-2 text-left text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              ⚠ <strong>Mock mod:</strong> Henüz e-posta servisi bağlı değil. Linki sunucu
              loglarında (PM2) görebilirsin: <code className="font-mono">pm2 logs grammar-hero</code>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setEmail("");
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Başka e-posta dene
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <p className="mb-2 text-4xl" aria-hidden>
          👋
        </p>
        <CardTitle className="text-2xl">Hoş Geldin</CardTitle>
        <p className="text-sm text-muted-foreground">
          E-postanı yaz, sana giriş linki yollayalım. Şifre yok.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-posta</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@gmail.com"
              autoComplete="email"
              autoFocus
              maxLength={254}
              required
            />
            <p className="text-xs text-muted-foreground">
              Aynı e-posta = aynı hesap. Farklı cihazda da aynı linki kullanabilirsin.
            </p>
          </div>

          <Button
            type="submit"
            size="xl"
            className="w-full"
            loading={pending}
            disabled={!canSubmit}
          >
            {!pending && <Send />} Magic Link Gönder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
