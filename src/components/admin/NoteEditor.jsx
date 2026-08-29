"use client";

import { useState } from "react";

function Field({ label, value, onChange, multiline = false, ...props }) {
  const common = {
    ...props,
    value: value ?? "",
    onChange: (event) => onChange(event.target.value),
    className: "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#c43c3c]",
  };
  return <label className="block text-sm font-bold text-gray-700">{label}{multiline ? <textarea {...common} /> : <input {...common} />}</label>;
}

function RevisionHistory({ revisions, onRestore, busy }) {
  if (!revisions?.length) return null;
  return <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black">Revision history</legend><div className="space-y-2">{revisions.map((revision) => <div key={revision.revisionId} className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 text-sm md:flex-row md:items-center md:justify-between"><div><p className="font-bold text-gray-800">Revision {revision.revisionNumber} · {revision.status}</p><p className="mt-1 text-xs text-gray-500">สร้างโดย {revision.createdBy || "system"} · {new Date(revision.createdAt).toLocaleString("th-TH")}{revision.publishedAt ? ` · published ${new Date(revision.publishedAt).toLocaleString("th-TH")}` : ""}</p></div>{revision.status !== "DRAFT" && <button type="button" disabled={busy} onClick={() => onRestore(revision.revisionId)} className="rounded-full border border-gray-300 px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-50">Restore as Draft</button>}</div>)}</div></fieldset>;
}

export default function NoteEditor({ documentId = null, initialPayload, draftRevisionId: initialDraftRevisionId = null, revisions = [] }) {
  const [payload, setPayload] = useState(initialPayload);
  const [draftRevisionId, setDraftRevisionId] = useState(initialDraftRevisionId || null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(path, value) {
    setPayload((current) => {
      const next = structuredClone(current);
      let target = next;
      for (const key of path.slice(0, -1)) target = target[key];
      target[path[path.length - 1]] = value;
      return next;
    });
  }

  function updateSeo(field, locale, value) {
    const seo = payload.seo?.[field] || { en: "", th: "" };
    update(["seo", field], value || seo.en || seo.th ? { ...seo, [locale]: value } : null);
  }

  async function call(path, body) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || "คำขอไม่สำเร็จ");
    return data;
  }

  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = documentId ? await call(`/api/admin/notes/${documentId}/draft`, { payload }) : await call("/api/admin/notes", { payload });
      setDraftRevisionId(result.revisionId);
      if (!documentId) window.location.href = `/admin/notes/${result.documentId}`;
      else setMessage(`บันทึก Draft revision ${result.revisionNumber} แล้ว`);
    } catch (saveError) { setError(saveError.message); }
    setBusy(false);
  }

  async function preview() {
    setBusy(true); setError("");
    try {
      const result = await call(`/api/admin/notes/${documentId}/preview`, { revisionId: draftRevisionId });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (previewError) { setError(previewError.message); }
    setBusy(false);
  }

  async function publish() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call(`/api/admin/notes/${documentId}/publish`, { revisionId: draftRevisionId });
      setDraftRevisionId(null); setMessage(`เผยแพร่ ${result.slug} revision ${result.revisionNumber} แล้ว`);
    } catch (publishError) { setError(publishError.message); }
    setBusy(false);
  }

  async function archive() {
    if (!window.confirm("ยืนยัน Archive Note นี้? ประวัติ revision จะยังคงอยู่")) return;
    setBusy(true); setError("");
    try {
      await call(`/api/admin/notes/${documentId}/archive`, { confirm: true });
      window.location.href = "/admin/notes";
    } catch (archiveError) { setError(archiveError.message); }
    setBusy(false);
  }

  async function restore(revisionId) {
    if (!documentId || !window.confirm("กู้คืน Revision นี้เป็น Draft ใหม่หรือไม่? ประวัติเดิมจะไม่ถูกแก้ไข")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call(`/api/admin/notes/${documentId}/restore`, { revisionId });
      setPayload(result.payload); setDraftRevisionId(result.revisionId); setMessage(`กู้คืนเป็น Draft revision ${result.revisionNumber} แล้ว`);
    } catch (restoreError) { setError(restoreError.message); }
    setBusy(false);
  }

  if (!payload) return <p className="p-8">ไม่พบข้อมูล Note</p>;

  return (
    <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Notes / Draft Editor</p><h1 className="mt-3 text-4xl font-black text-gray-900">{documentId ? "Edit Note" : "New Note"}</h1><p className="mt-3 text-sm text-gray-500">Markdown จะไม่เปิด raw HTML และ URL scheme ที่รันโค้ดได้</p></div><a href="/admin/notes" className="text-sm font-bold text-gray-500">← Notes</a></div>
        <div className="mt-8 flex flex-wrap gap-3"><button disabled={busy} onClick={save} className="rounded-full bg-gray-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Save Draft</button><button disabled={busy || !documentId || !draftRevisionId} onClick={preview} className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-black disabled:opacity-50">Preview exact Draft</button><button disabled={busy || !documentId || !draftRevisionId} onClick={publish} className="rounded-full bg-[#c43c3c] px-5 py-3 text-sm font-black text-white disabled:opacity-50">Publish</button>{documentId && <button disabled={busy} onClick={archive} className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 disabled:opacity-50">Archive</button>}</div>
        {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="mt-8 space-y-6">
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black">Identity / ตัวตน</legend><div className="grid gap-4 md:grid-cols-2"><Field label="Slug" value={payload.slug} onChange={(value) => update(["slug"], value)} /><Field label="Display order" type="number" value={payload.order} onChange={(value) => update(["order"], Number(value))} /><Field label="Title EN" value={payload.title.en} onChange={(value) => update(["title", "en"], value)} /><Field label="Title TH" value={payload.title.th} onChange={(value) => update(["title", "th"], value)} /><Field label="Raw filename" value={payload.rawName} onChange={(value) => update(["rawName"], value)} /><Field multiline label="Excerpt EN" value={payload.excerpt.en} onChange={(value) => update(["excerpt", "en"], value)} /><Field multiline label="Excerpt TH" value={payload.excerpt.th} onChange={(value) => update(["excerpt", "th"], value)} /></div></fieldset>
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black">Markdown body</legend><Field multiline rows={28} label="Body Markdown" value={payload.bodyMarkdown} onChange={(value) => update(["bodyMarkdown"], value)} /></fieldset>
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black">SEO</legend><div className="grid gap-4 md:grid-cols-2"><Field label="SEO title EN" value={payload.seo.title?.en || ""} onChange={(value) => updateSeo("title", "en", value)} /><Field label="SEO title TH" value={payload.seo.title?.th || ""} onChange={(value) => updateSeo("title", "th", value)} /><Field multiline label="SEO description EN" value={payload.seo.description?.en || ""} onChange={(value) => updateSeo("description", "en", value)} /><Field multiline label="SEO description TH" value={payload.seo.description?.th || ""} onChange={(value) => updateSeo("description", "th", value)} /></div></fieldset>
          <RevisionHistory revisions={revisions} onRestore={restore} busy={busy} />
        </div>
      </div>
    </section>
  );
}
