"use client";

import Link from "next/link";
import { Eye, EyeOff, Rocket } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "./actions";

interface PasswordCheck {
  label: string;
  ok: boolean;
}

function passwordChecks(pw: string): PasswordCheck[] {
  return [
    { label: "En az 8 karakter", ok: pw.length >= 8 },
    { label: "1 küçük harf (a-z)", ok: /[a-z]/.test(pw) },
    { label: "1 BÜYÜK harf (A-Z)", ok: /[A-Z]/.test(pw) },
    { label: "1 sayı (0-9)", ok: /\d/.test(pw) },
  ];
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const validEmail = /\S+@\S+\.\S+/.test(trimmedEmail);
  const checks = passwordChecks(password);
  const passwordOk = checks.every((c) => c.ok);
  const passwordsMatch = password.length > 0 && password === passwordConfirm;
  const canSubmit =
    validEmail && trimmedName.length >= 2 && passwordOk && passwordsMatch;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || pending) return;
    startTransition(async () => {
      const result = await registerAction({
        email: trimmedEmail,
        name: trimmedName,
        password,
        callbackUrl,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.push(result.redirectTo ?? "/onboarding/level");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <p className="mb-2 text-4xl" aria-hidden>
          🚀
        </p>
        <CardTitle className="text-2xl">Ücretsiz Hesap Aç</CardTitle>
        <p className="text-sm text-muted-foreground">
          Birkaç saniye sürer. Şifren güvenli şekilde saklanır.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-name">Adın</Label>
            <Input
              id="register-name"
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
              Profilde ve liderlik tablosunda görünür.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">E-posta</Label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@gmail.com"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Şifre</Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Güçlü bir şifre seç"
                autoComplete="new-password"
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
            <ul className="space-y-1 pt-1 text-xs">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className={c.ok ? "text-correct" : "text-muted-foreground"}
                >
                  {c.ok ? "✓" : "○"} {c.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password-confirm">Şifre (tekrar)</Label>
            <Input
              id="register-password-confirm"
              type={showPassword ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Aynı şifreyi tekrar yaz"
              autoComplete="new-password"
              maxLength={100}
              required
            />
            {passwordConfirm.length > 0 && (
              <p
                className={`text-xs ${passwordsMatch ? "text-correct" : "text-destructive"}`}
              >
                {passwordsMatch ? "✓ Şifreler eşleşiyor" : "✗ Şifreler eşleşmiyor"}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="xl"
            className="w-full"
            loading={pending}
            disabled={!canSubmit}
          >
            {!pending && <Rocket />} Hesap Aç ve Başla
          </Button>

          <p className="pt-2 text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link
              href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-semibold text-primary hover:underline"
            >
              Giriş yap
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
