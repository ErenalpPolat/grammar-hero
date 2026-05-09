import { Suspense } from "react";
import { VerifyClient } from "./verify-client";

export const metadata = { title: "Giriş Doğrulanıyor" };

export default async function VerifyPage(props: PageProps<"/auth/verify">) {
  const params = await props.searchParams;
  const tokenParam = Array.isArray(params?.token) ? params.token[0] : params?.token;

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Suspense>
        <VerifyClient token={tokenParam ?? null} />
      </Suspense>
    </div>
  );
}
