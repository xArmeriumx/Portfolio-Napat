"use client";

import { useState } from "react";

function TextField({ label, value, onChange, ...props }) {
  return <label className="block text-sm font-bold text-gray-700">{label}<input {...props} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#c43c3c]" /></label>;
}

function TextArea({ label, value, onChange, ...props }) {
  return <label className="block text-sm font-bold text-gray-700">{label}<textarea {...props} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#c43c3c]" /></label>;
}

function localized(value, language) {
  return value?.[language] ?? "";
}

export default function ProfileEditor({ initialPayload, draftRevisionId: initialDraftRevisionId }) {
  const [payload, setPayload] = useState(initialPayload);
  const [draftRevisionId, setDraftRevisionId] = useState(initialDraftRevisionId);
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

  async function call(path, body = {}) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || "คำขอไม่สำเร็จ");
    return data;
  }

  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call("/api/admin/profile/draft", { payload });
      setDraftRevisionId(result.revisionId);
      setMessage(`บันทึก Draft revision ${result.revisionNumber} แล้ว`);
    } catch (saveError) { setError(saveError.message); }
    setBusy(false);
  }

  async function preview() {
    setBusy(true); setError("");
    try {
      const result = await call("/api/admin/profile/preview", { revisionId: draftRevisionId });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (previewError) { setError(previewError.message); }
    setBusy(false);
  }

  async function publish() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call("/api/admin/profile/publish", { revisionId: draftRevisionId });
      setDraftRevisionId(null);
      setMessage(`เผยแพร่ revision ${result.revisionNumber} แล้ว`);
    } catch (publishError) { setError(publishError.message); }
    setBusy(false);
  }

  if (!payload) return <p className="p-8">ยังไม่มี imported Profile</p>;
  return (
    <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Profile / Draft Editor</p><h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">Edit Profile</h1><p className="mt-3 text-gray-500">ทุกการบันทึกเป็น Draft จนกว่าจะกด Publish</p></div>
          <a href="/admin" className="text-sm font-bold text-gray-500 hover:text-gray-900">← Back to admin</a>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button disabled={busy} onClick={save} className="rounded-full bg-gray-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Save Draft</button>
          <button disabled={busy || !draftRevisionId} onClick={preview} className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-black text-gray-800 disabled:opacity-50">Preview exact Draft</button>
          <button disabled={busy || !draftRevisionId} onClick={publish} className="rounded-full bg-[#c43c3c] px-5 py-3 text-sm font-black text-white disabled:opacity-50">Publish</button>
          {draftRevisionId && <span className="self-center text-xs font-bold text-amber-700">Draft: {draftRevisionId}</span>}
        </div>
        {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-8 space-y-6">
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black text-gray-900">Identity / ตัวตน</legend><div className="grid gap-4 md:grid-cols-2"><TextField label="Name EN" value={localized(payload.identity.name, "en")} onChange={(value) => update(["identity", "name", "en"], value)} /><TextField label="Name TH" value={localized(payload.identity.name, "th")} onChange={(value) => update(["identity", "name", "th"], value)} /><TextField label="Headline EN" value={localized(payload.identity.headline, "en")} onChange={(value) => update(["identity", "headline", "en"], value)} /><TextField label="Headline TH" value={localized(payload.identity.headline, "th")} onChange={(value) => update(["identity", "headline", "th"], value)} /><TextArea label="Tagline EN" value={localized(payload.identity.tagline, "en")} onChange={(value) => update(["identity", "tagline", "en"], value)} /><TextArea label="Tagline TH" value={localized(payload.identity.tagline, "th")} onChange={(value) => update(["identity", "tagline", "th"], value)} /></div></fieldset>
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black text-gray-900">Biography / ประวัติ</legend><div className="grid gap-4 md:grid-cols-2"><TextArea label="Biography EN" value={localized(payload.biography, "en")} onChange={(value) => update(["biography", "en"], value)} /><TextArea label="Biography TH" value={localized(payload.biography, "th")} onChange={(value) => update(["biography", "th"], value)} /><TextArea label="Education EN (one line per item)" value={payload.education.map((item) => item.en).join("\n")} onChange={(value) => update(["education"], value.split("\n").map((en, index) => ({ en, th: payload.education[index]?.th || en })))} /><TextArea label="Education TH (one line per item)" value={payload.education.map((item) => item.th).join("\n")} onChange={(value) => update(["education"], value.split("\n").map((th, index) => ({ en: payload.education[index]?.en || th, th })))} /></div></fieldset>
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black text-gray-900">Contact & links</legend><div className="grid gap-4 md:grid-cols-2"><TextField label="Email" type="email" value={payload.contact.links.email} onChange={(value) => update(["contact", "links", "email"], value)} /><TextField label="Phone" value={payload.contact.phone} onChange={(value) => update(["contact", "phone"], value)} /><TextField label="Location EN" value={localized(payload.contact.location, "en")} onChange={(value) => update(["contact", "location", "en"], value)} /><TextField label="Location TH" value={localized(payload.contact.location, "th")} onChange={(value) => update(["contact", "location", "th"], value)} /><TextField label="GitHub" value={payload.contact.links.github} onChange={(value) => update(["contact", "links", "github"], value || null)} /><TextField label="LinkedIn" value={payload.contact.links.linkedin} onChange={(value) => update(["contact", "links", "linkedin"], value || null)} /><TextField label="Resume path/URL" value={payload.contact.links.resume} onChange={(value) => update(["contact", "links", "resume"], value || null)} /></div></fieldset>
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black text-gray-900">Skills & categories</legend><p className="mb-4 text-sm text-gray-500">จัดการชื่อ/logo/order ของ skill ได้ โดยไม่แก้ layout ของ Frontend</p><TextArea label="Categories JSON" rows={18} value={JSON.stringify(payload.skillCategories, null, 2)} onChange={(value) => { try { update(["skillCategories"], JSON.parse(value)); } catch { setError("Categories JSON ยังไม่สมบูรณ์"); } }} /></fieldset>
        </div>
      </div>
    </section>
  );
}
