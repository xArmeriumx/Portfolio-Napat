import { NextResponse } from "next/server";
import { restoreRevision } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  const admin = await requireAdminApi();
  if (!admin) return unauthorizedResponse();
  try {
    const body = await request.json();
    if (!body?.revisionId) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "ต้องระบุ Revision ที่ต้องการกู้คืน" } }, { status: 422 });
    return NextResponse.json(await restoreRevision(prisma, { contentType: "PROJECT", documentId: (await params).id, revisionId: body.revisionId, actorId: admin.user.id }), { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
