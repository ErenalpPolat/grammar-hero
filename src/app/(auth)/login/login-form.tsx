"use client";

import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const validEmail = /\S+@\S+\.\S+/.test(trimmedEmail);
  const canSubmit =
    validEmail && password.length >= 6 && trimmedName.length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || pending) return;
    startTransition(async () => {
      const result = await loginAction({
        email: trimmedEmail,
        password,
        name: trimmedName,
        callbackUrl,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.push(result.redirectTo ?? "/learn");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <p className="mb-2 text-4xl" aria-hidden>
          👋
        </p>
        <CardTitle className="text-2xl">Hoş Geldin</CardTitle>
        <p className="text-sm text-muted-foreground">
          E-posta + şifrenle giriş yap. İlk kez geliyorsan hesabın bu adınla otomatik oluşur.
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Şifre</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                autoComplete="current-password"
                minLength={6}
                maxLength={100}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-name">Adın</Label>
            <Input
              id="login-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn. Polat"
              autoComplete="given-name"
              maxLength={40}
              required
            />
            <p className="text-xs text-muted-foreground">
              Profilde ve liderlik tablosunda görünür. Mevcut hesaba giriyorsan
              kayıtlı adın korunur (yazdığın ad ignored).
            </p>
          </div>

          <Button
            type="submit"
            size="xl"
            className="w-full"
            loading={pending}
            disabled={!canSubmit}
          >
            {!pending && <LogIn />} Giriş Yap
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
