"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { verifyMagicLinkAction } from "./actions";

type Status =
  | { kind: "verifying" }
  | { kind: "success"; redirectTo: string }
  | { kind: "error"; message: string };

export function VerifyClient({ token }: { token: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(
    token ? { kind: "verifying" } : { kind: "error", message: "Link eksik veya bozuk." },
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const result = await verifyMagicLinkAction({ token });
      if (cancelled) return;
      if (result.error) {
        setStatus({ kind: "error", message: result.error });
        return;
      }
      const redirectTo = result.redirectTo ?? "/learn";
      setStatus({ kind: "success", redirectTo });
      router.push(redirectTo);
      router.refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (status.kind === "verifying") {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 size-10 animate-spin text-primary" aria-hidden />
        <p className="text-lg font-semibold">Doğrulanıyor…</p>
        <p className="mt-1 text-sm text-muted-foreground">Saniyeler içinde girişin tamamlanacak.</p>
      </div>
    );
  }

  if (status.kind === "success") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 size-10 text-correct" aria-hidden />
        <p className="text-lg font-semibold">Giriş başarılı</p>
        <p className="mt-1 text-sm text-muted-foreground">{status.redirectTo} sayfasına gidiliyor…</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm text-center">
      <XCircle className="mx-auto mb-4 size-10 text-destructive" aria-hidden />
      <p className="text-lg font-semibold">{status.message}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Yeni bir link iste:{" "}
        <a href="/login" className="font-semibold text-primary hover:underline">
          Giriş sayfasına dön
        </a>
      </p>
    </div>
  );
}
