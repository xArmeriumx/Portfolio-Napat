import { NextResponse } from "next/server";
import { getAdminContent, ContentNotFoundError } from "@/content/admin-service";
import { requireAdminApi } from "@/server/auth-guard";
import { prisma } from "@/server/db";
import { adminErrorResponse, unauthorizedResponse } from "@/server/admin-http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminApi())) return unauthorizedResponse();
  try {
    return NextResponse.json(await getAdminContent(prisma, "PROFILE", "profile"));
  } catch (error) {
    if (error instanceof ContentNotFoundError) return NextResponse.json({ error: { code: "NOT_IMPORTED", message: "ยังไม่มี Profile ในฐานข้อมูล" } }, { status: 404 });
    return adminErrorResponse(error);
  }
}
