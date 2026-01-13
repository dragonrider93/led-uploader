"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type VerifyClientProps = {
  token: string | null;
};

export default function VerifyClient({ token }: VerifyClientProps) {
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    // redirect ke API verify (server will set cookie)
    window.location.href = `/api/auth/verify?token=${encodeURIComponent(token)}`;
  }, [token, router]);

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Signing you in…</h1>
      <p style={{ marginTop: 8 }}>Please wait.</p>
    </main>
  );
}
