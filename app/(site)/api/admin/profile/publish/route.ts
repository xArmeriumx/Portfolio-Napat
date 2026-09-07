import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { publishDraft } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  const admin = await requireAdminApi();
  if (!admin) return unauthorizedResponse();
  try {
    const body = await request.json().catch(() => ({}));
    const result = await publishDraft(prisma, {
      contentType: "PROFILE",
      documentId: "profile",
      actorId: admin.user.id,
      revisionId: body?.revisionId,
    });
    for (const path of ["/", "/about", "/contact", "/search", "/sitemap.xml"]) revalidatePath(path);
    return NextResponse.json(result);
  } catch (error) {
    return adminErrorResponse(error);
  }
}
