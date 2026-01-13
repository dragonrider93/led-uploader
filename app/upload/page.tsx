"use client";

import { useState } from "react";

type ImportResult = {
  ok: boolean;
  inserted: number;
  skipped: number;
  total: number;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setImportId(null);

    if (!file) {
      setError("Pilih file Excel dulu.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || "Upload gagal");
      }

      setImportId(json.import_id || null);
      setResult(json.result || null);
    } catch (err: any) {
      setError(err?.message || "Terjadi error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="mb-4 text-center">
              <div className="text-uppercase text-secondary small fw-semibold">
                Admin Upload Center
              </div>
              <h1 className="display-6 fw-semibold mt-2">Upload Excel untuk Import Data</h1>
              <p className="text-secondary mt-2">
                Upload file .xlsx, sistem akan cek duplikasi dan menambahkan data baru ke database.
              </p>
            </div>

            <div className="row g-4 align-items-start">
              <div className="col-lg-7">
                {error && (
                  <div className="alert alert-danger rounded-4 mb-4">
                    {error}
                  </div>
                )}

                {result && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="h5 fw-semibold mb-1">Hasil Import</div>
                        {importId ? (
                          <div className="text-secondary small">
                            Import ID: <span className="fw-semibold">{importId}</span>
                          </div>
                        ) : null}
                      </div>
                      <span
                        className={`badge ${
                          result.ok ? "text-bg-success" : "text-bg-warning"
                        }`}
                      >
                        {result.ok ? "SUKSES" : "CEK DATA"}
                      </span>
                    </div>

                    <div className="row g-3 mt-3">
                      <div className="col-sm-4">
                        <Stat label="Total" value={result.total} />
                      </div>
                      <div className="col-sm-4">
                        <Stat label="Inserted" value={result.inserted} />
                      </div>
                      <div className="col-sm-4">
                        <Stat label="Skipped" value={result.skipped} />
                      </div>
                    </div>

                    <div className="text-secondary small mt-3">
                      Skipped biasanya karena data sudah ada (fingerprint duplicate).
                    </div>
                  </div>
                )}

                <form
                  onSubmit={onSubmit}
                  className="card border-0 shadow-sm rounded-4 p-4"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h2 className="h5 fw-semibold mb-1">File Excel</h2>
                      <div className="text-secondary small">Format .xlsx</div>
                    </div>
                    <span className="badge text-bg-warning">Auto Dedupe</span>
                  </div>

                  <label className="mt-4 w-100 border border-2 border-dashed rounded-4 p-4 text-center bg-light">
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="form-control d-none"
                    />
                    <div className="fs-2">📤</div>
                    <div className="fw-semibold mt-2">Klik untuk memilih file</div>
                    <div className="text-secondary small">
                      Pastikan header kolom sesuai template.
                    </div>
                  </label>

                  {file && (
                    <div className="alert alert-light border mt-3 mb-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="text-secondary small">File terpilih</div>
                          <div className="fw-semibold">{file.name}</div>
                        </div>
                        <div className="text-secondary small">
                          {Math.round(file.size / 1024)} KB
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="btn btn-dark btn-lg w-100 mt-4"
                  >
                    {loading ? "Mengirim file..." : "Upload & Import"}
                  </button>
                  <div className="text-secondary small text-center mt-2">
                    Dengan klik upload, kamu menyetujui proses import otomatis.
                  </div>
                </form>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                  <div className="fw-semibold">Checklist sebelum upload</div>
                  <ul className="list-unstyled mt-3 mb-0 text-secondary small">
                    <li className="d-flex gap-2 mb-2">
                      <span>✅</span>
                      <span>Pastikan file nya dari gmaps crawler.</span>
                    </li>
                    <li className="d-flex gap-2 mb-2">
                      <span>✅</span>
                      <span>Tidak ada baris kosong di tengah data.</span>
                    </li>
                  </ul>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <div className="fw-semibold">Apa yang terjadi setelah upload?</div>
                  <p className="text-secondary small mt-2 mb-0">
                    Sistem membaca file, cek duplikasi, lalu menambahkan data baru.
                    Status import akan muncul di bawah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-4 bg-light text-center py-3">
      <div className="text-uppercase text-secondary small">{label}</div>
      <div className="fs-3 fw-semibold text-dark mt-1">{value}</div>
    </div>
  );
}
