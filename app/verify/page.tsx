import { Suspense } from "react";
import VerifyClient from "./verify-client";

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
