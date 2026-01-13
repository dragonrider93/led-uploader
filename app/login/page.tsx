"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/send-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin Login</h1>
      <p style={{ marginTop: 8 }}>Enter your email to receive a magic link.</p>

      {!sent ? (
        <form onSubmit={onSend} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@dpremi.com"
            type="email"
            required
            style={{ padding: 12, border: "1px solid #ccc", borderRadius: 10 }}
          />
          <button
            disabled={loading}
            style={{ padding: 12, borderRadius: 10, border: "1px solid #000" }}
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>
      ) : (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          If your email is allowed, you’ll receive a login link shortly.
        </div>
      )}
    </main>
  );
}