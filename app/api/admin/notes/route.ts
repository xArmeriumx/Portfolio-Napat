import { NextResponse } from "next/server";
import { createContentDraft, listAdminContent } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminApi())) return unauthorizedResponse();
  try {
    return NextResponse.json(await listAdminContent(prisma, "NOTE"));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  const admin = await requireAdminApi();
  if (!admin) return unauthorizedResponse();
  try {
    const body = await request.json();
    return NextResponse.json(await createContentDraft(prisma, { contentType: "NOTE", actorId: admin.user.id, payload: body?.payload }), { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
