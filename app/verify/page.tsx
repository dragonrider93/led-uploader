"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // redirect ke API verify (server will set cookie)
    window.location.href = `/api/auth/verify?token=${encodeURIComponent(token)}`;
  }, [searchParams, router]);

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Signing you in…</h1>
      <p style={{ marginTop: 8 }}>Please wait.</p>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Signing you in…</h1>
          <p style={{ marginTop: 8 }}>Please wait.</p>
        </main>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
