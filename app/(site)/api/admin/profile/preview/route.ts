import { NextResponse } from "next/server";
import { getAdminContent } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { createPreviewToken } from "@/server/preview-token";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  if (!(await requireAdminApi())) return unauthorizedResponse();
  try {
    const body = await request.json().catch(() => ({}));
    const content = await getAdminContent(prisma, "PROFILE", "profile");
    const revisionId = body?.revisionId || content.draft?.revisionId;
    if (!revisionId) return NextResponse.json({ error: { code: "NO_DRAFT", message: "ยังไม่มี Draft ให้ Preview" } }, { status: 409 });
    const token = createPreviewToken({ contentType: "PROFILE", documentId: "profile", revisionId });
    return NextResponse.json({ url: `/preview/profile?token=${encodeURIComponent(token)}`, expiresInSeconds: 900 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
