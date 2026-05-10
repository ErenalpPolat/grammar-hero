"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  const handleRetry = () => {
    reset();
    router.refresh();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" aria-hidden />
      </div>
      <h1 className="mt-4 text-3xl font-bold">Bir şey ters gitti</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Beklenmedik bir hata oluştu. Tekrar dene ya da anasayfaya dön.
      </p>
      {error.message && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">digest: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleRetry}>
          <RefreshCw /> Tekrar dene
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          <Home /> Anasayfa
        </Button>
      </div>
    </div>
  );
}
