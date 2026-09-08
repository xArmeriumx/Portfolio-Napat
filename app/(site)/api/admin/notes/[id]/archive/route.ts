import { revalidatePublishedContent } from "@/content/revalidate";
import { NextResponse } from "next/server";
import { archiveContent } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { adminErrorResponse, confirmationRequiredResponse, hasExplicitConfirmation, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  const admin = await requireAdminApi();
  if (!admin) return unauthorizedResponse();
  if (!(await hasExplicitConfirmation(request))) return confirmationRequiredResponse();
  try {
    const result = await archiveContent(prisma, { contentType: "NOTE", documentId: (await params).id, actorId: admin.user.id });
    revalidatePublishedContent();
    return NextResponse.json(result);
  } catch (error) {
    return adminErrorResponse(error);
  }
}
