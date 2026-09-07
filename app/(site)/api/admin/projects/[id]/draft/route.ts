import { NextResponse } from "next/server";
import { saveDraft } from "@/content/admin-service";
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
    return NextResponse.json(await saveDraft(prisma, { contentType: "PROJECT", documentId: (await params).id, actorId: admin.user.id, payload: (await request.json())?.payload }), { status: 201 });
  } catch (error) { return adminErrorResponse(error); }
}
