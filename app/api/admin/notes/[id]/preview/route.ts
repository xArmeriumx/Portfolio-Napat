import { NextResponse } from "next/server";
import { getAdminContent } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { createPreviewToken } from "@/server/preview-token";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  if (!(await requireAdminApi())) return unauthorizedResponse();
  try {
    const id = (await params).id;
    const content = await getAdminContent(prisma, "NOTE", id);
    const revisionId = (await request.json().catch(() => ({})))?.revisionId || content.draft?.revisionId;
    if (!revisionId) return NextResponse.json({ error: { code: "NO_DRAFT", message: "ยังไม่มี Draft ให้ Preview" } }, { status: 409 });
    const token = createPreviewToken({ contentType: "NOTE", documentId: id, revisionId });
    return NextResponse.json({ url: `/preview/note/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, expiresInSeconds: 900 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
