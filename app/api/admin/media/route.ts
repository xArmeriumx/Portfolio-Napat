import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/server/csrf";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";
import { deletePortfolioMedia, uploadPortfolioMedia } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  const admin = await requireAdminApi();
  if (!admin) return unauthorizedResponse();
  let uploaded: Awaited<ReturnType<typeof uploadPortfolioMedia>> | null = null;
  try {
    const form = await request.formData();
    const projectId = String(form.get("projectId") || "");
    const file = form.get("file");
    if (!projectId || !(file instanceof File)) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "ต้องระบุ project และไฟล์ภาพ" } }, { status: 422 });
    const project = await prisma.contentDocument.findFirst({ where: { id: projectId, contentType: "PROJECT" }, select: { id: true, status: true } });
    if (!project) return NextResponse.json({ error: { code: "NOT_FOUND", message: "ไม่พบ Project" } }, { status: 404 });
    if (project.status === "ARCHIVED") return NextResponse.json({ error: { code: "CONFLICT", message: "ไม่สามารถเพิ่ม Media ให้ Project ที่ Archive แล้ว" } }, { status: 409 });
    uploaded = await uploadPortfolioMedia({
      projectId,
      file,
      altEn: String(form.get("altEn") || file.name),
      altTh: String(form.get("altTh") || form.get("altEn") || file.name),
      captionEn: String(form.get("captionEn") || "") || null,
      captionTh: String(form.get("captionTh") || "") || null,
    });
    const asset = await prisma.mediaAsset.create({
      data: { id: randomUUID(), ...uploaded, createdBy: admin.user.id },
    });
    return NextResponse.json({ media: { id: asset.id, storageKey: asset.storageKey, url: asset.publicUrl, mimeType: asset.mimeType, width: asset.width, height: asset.height, alt: { en: asset.altEn, th: asset.altTh }, caption: asset.captionEn || asset.captionTh ? { en: asset.captionEn || "", th: asset.captionTh || asset.captionEn || "" } : null, order: 0 } }, { status: 201 });
  } catch (error) {
    if (uploaded) await deletePortfolioMedia(uploaded.storageKey).catch(() => undefined);
    return adminErrorResponse(error);
  }
}
