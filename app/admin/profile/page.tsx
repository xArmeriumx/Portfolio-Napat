import type { Metadata } from "next";
import { requireAdminPage } from "@/server/auth-guard";
import { getAdminContent } from "@/content/admin-service";
import { prisma } from "@/server/db";
import ProfileEditor from "@/components/admin/ProfileEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Profile", robots: { index: false, follow: false } };

export default async function AdminProfilePage() {
  await requireAdminPage();
  const content = await getAdminContent(prisma, "PROFILE", "profile");
  const payload = content.draft?.payload || content.published?.payload;
  return <ProfileEditor initialPayload={payload} draftRevisionId={content.draft?.revisionId || null} />;
}
