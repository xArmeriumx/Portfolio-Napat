import { NextResponse } from "next/server";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";
import { deletePortfolioMedia } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  if (!(await requireAdminApi())) return unauthorizedResponse();
  const id = (await params).id;
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id }, include: { references: { include: { revision: { include: { publishedFor: true } } } } } });
    if (!asset) return NextResponse.json({ error: { code: "NOT_FOUND", message: "ไม่พบ Media" } }, { status: 404 });
    if (asset.references.some((reference) => Boolean(reference.revision.publishedFor))) return NextResponse.json({ error: { code: "REFERENCED_BY_PUBLISHED", message: "ลบไม่ได้: Media นี้ถูกใช้อยู่ใน Published Revision" } }, { status: 409 });
    if (asset.references.length > 0) return NextResponse.json({ error: { code: "REFERENCED_BY_DRAFT", message: "ลบไม่ได้: กรุณานำ Media ออกจาก Draft ก่อน" } }, { status: 409 });
    await deletePortfolioMedia(asset.storageKey);
    await prisma.mediaAsset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return adminErrorResponse(error); }
}
