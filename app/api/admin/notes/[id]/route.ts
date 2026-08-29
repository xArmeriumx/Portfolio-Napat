import { NextResponse } from "next/server";
import { getAdminContent } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return unauthorizedResponse();
  try {
    return NextResponse.json(await getAdminContent(prisma, "NOTE", (await params).id));
  } catch (error) {
    return adminErrorResponse(error);
  }
}
