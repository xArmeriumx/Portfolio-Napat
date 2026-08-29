import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { publishDraft } from "@/content/admin-service";
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
    const id = (await params).id;
    const result = await publishDraft(prisma, { contentType: "PROJECT", documentId: id, actorId: admin.user.id, revisionId: (await request.json().catch(() => ({})))?.revisionId });
    for (const path of ["/", "/projects", "/search", "/sitemap.xml"]) revalidatePath(path);
    if (result.slug) revalidatePath(`/projects/${result.slug}`);
    if (result.previousSlug) revalidatePath(`/projects/${result.previousSlug}`);
    return NextResponse.json(result);
  } catch (error) { return adminErrorResponse(error); }
}
