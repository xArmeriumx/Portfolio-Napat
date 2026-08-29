import { revalidatePath } from "next/cache";
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
    const id = (await params).id;
    const result = await archiveContent(prisma, { contentType: "PROJECT", documentId: id, actorId: admin.user.id });
    revalidatePath("/projects");
    revalidatePath("/search");
    revalidatePath("/sitemap.xml");
    if (result.slug) revalidatePath(`/projects/${result.slug}`);
    return NextResponse.json(result);
  } catch (error) { return adminErrorResponse(error); }
}
