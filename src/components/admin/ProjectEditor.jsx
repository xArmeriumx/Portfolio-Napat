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

function lines(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function setLines(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function RevisionHistory({ revisions, onRestore, busy }) {
  if (!revisions?.length) return null;
  return <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black">Revision history</legend><div className="space-y-2">{revisions.map((revision) => <div key={revision.revisionId} className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 text-sm md:flex-row md:items-center md:justify-between"><div><p className="font-bold text-gray-800">Revision {revision.revisionNumber} · {revision.status}</p><p className="mt-1 text-xs text-gray-500">สร้างโดย {revision.createdBy || "system"} · {new Date(revision.createdAt).toLocaleString("th-TH")}{revision.publishedAt ? ` · published ${new Date(revision.publishedAt).toLocaleString("th-TH")}` : ""}</p></div>{revision.status !== "DRAFT" && <button type="button" disabled={busy} onClick={() => onRestore(revision.revisionId)} className="rounded-full border border-gray-300 px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-50">Restore as Draft</button>}</div>)}</div></fieldset>;
}

export default function ProjectEditor({ documentId = null, initialPayload, draftRevisionId: initialDraftRevisionId = null, revisions = [] }) {
  const [payload, setPayload] = useState(initialPayload);
  const [draftRevisionId, setDraftRevisionId] = useState(initialDraftRevisionId || null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaAltEn, setMediaAltEn] = useState("");
  const [mediaAltTh, setMediaAltTh] = useState("");

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
    const current = payload.seo?.[field] || { en: "", th: "" };
    const next = { ...current, [locale]: value };
    update(["seo", field], next.en.trim() || next.th.trim() ? next : null);
  }

  async function call(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || "คำขอไม่สำเร็จ");
    return data;
  }

  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = documentId
        ? await call(`/api/admin/projects/${documentId}/draft`, { payload })
        : await call("/api/admin/projects", { payload });
      setDraftRevisionId(result.revisionId);
      if (!documentId) window.location.href = `/admin/projects/${result.documentId}`;
      else setMessage(`บันทึก Draft revision ${result.revisionNumber} แล้ว`);
    } catch (saveError) {
      setError(saveError.message);
    }
    setBusy(false);
  }

  async function preview() {
    setBusy(true);
    setError("");
    try {
      const result = await call(`/api/admin/projects/${documentId}/preview`, { revisionId: draftRevisionId });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (previewError) {
      setError(previewError.message);
    }
    setBusy(false);
  }

  async function publish() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await call(`/api/admin/projects/${documentId}/publish`, { revisionId: draftRevisionId });
      setDraftRevisionId(null);
      setMessage(`เผยแพร่ ${result.slug} revision ${result.revisionNumber} แล้ว`);
    } catch (publishError) {
      setError(publishError.message);
    }
    setBusy(false);
  }

  async function archive() {
    if (!window.confirm("ยืนยัน Archive Project นี้? ประวัติ revision จะยังคงอยู่")) return;
    setBusy(true);
    setError("");
    try {
      await call(`/api/admin/projects/${documentId}/archive`, { confirm: true });
      window.location.href = "/admin/projects";
    } catch (archiveError) {
      setError(archiveError.message);
    }
    setBusy(false);
  }

  async function uploadMedia() {
    if (!documentId || !mediaFile) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.set("projectId", documentId);
      form.set("file", mediaFile);
      form.set("altEn", mediaAltEn || mediaFile.name);
      form.set("altTh", mediaAltTh || mediaAltEn || mediaFile.name);
      const response = await fetch("/api/admin/media", { method: "POST", credentials: "include", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error?.message || "อัปโหลด media ไม่สำเร็จ");
      const currentMedia = payload.media || [];
      update(["media"], [...currentMedia, { ...data.media, order: currentMedia.length }]);
      setMediaFile(null);
      setMediaAltEn("");
      setMediaAltTh("");
      setMessage("อัปโหลด media แล้ว กด Save Draft เพื่อบันทึกเข้า revision");
    } catch (uploadError) {
      setError(uploadError.message);
    }
    setBusy(false);
  }

  async function restore(revisionId) {
    if (!documentId || !window.confirm("กู้คืน Revision นี้เป็น Draft ใหม่หรือไม่? ประวัติเดิมจะไม่ถูกแก้ไข")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call(`/api/admin/projects/${documentId}/restore`, { revisionId });
      setPayload(result.payload); setDraftRevisionId(result.revisionId); setMessage(`กู้คืนเป็น Draft revision ${result.revisionNumber} แล้ว`);
    } catch (restoreError) { setError(restoreError.message); }
    setBusy(false);
  }

  if (!payload) return <p className="p-8">ไม่พบข้อมูล Project</p>;

  return (
    <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Project / Draft Editor</p>
            <h1 className="mt-3 text-4xl font-black text-gray-900">{documentId ? "Edit Project" : "New Project"}</h1>
            <p className="mt-3 text-sm text-gray-500">แก้ไขได้เฉพาะ structured content; layout และ component อยู่ใน source code</p>
          </div>
          <a href="/admin/projects" className="text-sm font-bold text-gray-500">← Projects</a>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button disabled={busy} onClick={save} className="rounded-full bg-gray-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Save Draft</button>
          <button disabled={busy || !documentId || !draftRevisionId} onClick={preview} className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-black disabled:opacity-50">Preview exact Draft</button>
          <button disabled={busy || !documentId || !draftRevisionId} onClick={publish} className="rounded-full bg-[#c43c3c] px-5 py-3 text-sm font-black text-white disabled:opacity-50">Publish</button>
          {documentId && <button disabled={busy} onClick={archive} className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 disabled:opacity-50">Archive</button>}
        </div>

        {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-8 space-y-6">
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6">
            <legend className="px-2 text-lg font-black">Identity / ตัวตน</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Slug" value={payload.slug} onChange={(value) => update(["slug"], value)} />
              <Field label="Display order" type="number" value={payload.order} onChange={(value) => update(["order"], Number(value))} />
              <Field label="Title EN" value={payload.title.en} onChange={(value) => update(["title", "en"], value)} />
              <Field label="Title TH" value={payload.title.th} onChange={(value) => update(["title", "th"], value)} />
              <Field multiline label="Description EN" value={payload.description.en} onChange={(value) => update(["description", "en"], value)} />
              <Field multiline label="Description TH" value={payload.description.th} onChange={(value) => update(["description", "th"], value)} />
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm font-bold text-gray-700"><input type="checkbox" checked={Boolean(payload.featured)} onChange={(event) => update(["featured"], event.target.checked)} /> Featured project</label>
          </fieldset>

          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6">
            <legend className="px-2 text-lg font-black">Case study fields</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <Field multiline label="Roles (one per line)" value={lines(payload.role)} onChange={(value) => update(["role"], setLines(value))} />
              <Field multiline label="Technologies (one per line)" value={lines(payload.technologies)} onChange={(value) => update(["technologies"], setLines(value))} />
              <Field multiline label="Key features EN" value={lines(payload.keyFeatures.en)} onChange={(value) => update(["keyFeatures", "en"], setLines(value))} />
              <Field multiline label="Key features TH" value={lines(payload.keyFeatures.th)} onChange={(value) => update(["keyFeatures", "th"], setLines(value))} />
              <Field multiline label="Highlights EN" value={lines(payload.highlights.en)} onChange={(value) => update(["highlights", "en"], setLines(value))} />
              <Field multiline label="Highlights TH" value={lines(payload.highlights.th)} onChange={(value) => update(["highlights", "th"], setLines(value))} />
              <Field multiline label="Responsibilities EN" value={lines(payload.responsibilities.en)} onChange={(value) => update(["responsibilities", "en"], setLines(value))} />
              <Field multiline label="Responsibilities TH" value={lines(payload.responsibilities.th)} onChange={(value) => update(["responsibilities", "th"], setLines(value))} />
              <Field multiline label="Metrics (one per line)" value={lines(payload.metrics)} onChange={(value) => update(["metrics"], setLines(value))} />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6">
            <legend className="px-2 text-lg font-black">Links & managed media</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Demo URL" value={payload.links.demo} onChange={(value) => update(["links", "demo"], value || null)} />
              <Field label="Repository URL" value={payload.links.repo} onChange={(value) => update(["links", "repo"], value || null)} />
            </div>
            {documentId && <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-sm font-black text-gray-800">Upload managed media</p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPEG หรือ WebP ไม่เกิน 10 MB; ไฟล์จะอยู่ใน Supabase Storage หลังผ่านการตรวจ MIME และ magic bytes</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <input aria-label="Media file" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
                <input aria-label="Media alt English" value={mediaAltEn} onChange={(event) => setMediaAltEn(event.target.value)} placeholder="Alt text EN" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
                <input aria-label="Media alt Thai" value={mediaAltTh} onChange={(event) => setMediaAltTh(event.target.value)} placeholder="Alt text TH" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
              </div>
              <button type="button" disabled={busy || !mediaFile} onClick={uploadMedia} className="mt-3 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-black disabled:opacity-50">Upload media</button>
            </div>}
            <Field multiline rows={16} label="Media references JSON (managed upload metadata)" value={JSON.stringify(payload.media, null, 2)} onChange={(value) => { try { update(["media"], JSON.parse(value)); setError(""); } catch { setError("Media JSON ยังไม่สมบูรณ์"); } }} />
          </fieldset>
          <fieldset className="rounded-2xl border border-gray-200 bg-white p-6"><legend className="px-2 text-lg font-black">SEO overrides</legend><p className="mb-4 text-sm text-gray-500">เว้นว่างเพื่อให้ metadata และ JSON-LD สร้างจากข้อมูล Project ที่ Published</p><div className="grid gap-4 md:grid-cols-2"><Field label="SEO title EN" value={payload.seo?.title?.en} onChange={(value) => updateSeo("title", "en", value)} /><Field label="SEO title TH" value={payload.seo?.title?.th} onChange={(value) => updateSeo("title", "th", value)} /><Field multiline label="SEO description EN" value={payload.seo?.description?.en} onChange={(value) => updateSeo("description", "en", value)} /><Field multiline label="SEO description TH" value={payload.seo?.description?.th} onChange={(value) => updateSeo("description", "th", value)} /><Field label="SEO image path/URL" value={payload.seo?.image} onChange={(value) => update(["seo", "image"], value || null)} /></div></fieldset>
          <RevisionHistory revisions={revisions} onRestore={restore} busy={busy} />
        </div>
      </div>
    </section>
  );
}
