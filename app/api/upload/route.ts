import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // auth guard (MVP)
  const cookie = req.headers.get("cookie") || "";
  if (!cookie.includes("admin_session=")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.N8N_IMPORT_API_KEY;

  if (!webhookUrl || !apiKey) {
    return NextResponse.json({ error: "n8n webhook not configured" }, { status: 500 });
  }

  const importId = randomUUID();

  const buf = Buffer.from(await file.arrayBuffer());
  const payload = {
    import_id: importId,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    file_base64: buf.toString("base64"),
  };

  // optional: timeout 60s
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 60_000);

  let raw = "";
  try {
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
        "x-import-id": importId,
        "x-file-name": file.name,
      },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });

    raw = await n8nRes.text().catch(() => "");
    if (!n8nRes.ok) {
      return NextResponse.json(
        { error: "n8n error", status: n8nRes.status, raw },
        { status: 502 }
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: "n8n request failed", message: e?.message || String(e) },
      { status: 502 }
    );
  } finally {
    clearTimeout(t);
  }

  let result: any;
  try {
    result = JSON.parse(raw);
  } catch {
    result = { raw };
  }

  return NextResponse.json({
    ok: true,
    import_id: importId,
    result, // { ok, inserted, skipped, total } dari n8n
  });
}