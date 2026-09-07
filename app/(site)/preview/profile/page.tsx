import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home from "@/views/Home.jsx";
import { profileDraftSchema } from "@/content/input-schema";
import { getPreviewRevision } from "@/content/admin-service";
import { toPresentationProfile } from "@/content/presentation";
import { assertPortfolioDatabaseTarget, prisma } from "@/server/db";
import { verifyPreviewToken } from "@/server/preview-token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Profile Preview",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ProfilePreviewPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const claims = token ? verifyPreviewToken(token) : null;
  if (!claims || claims.contentType !== "PROFILE" || claims.documentId !== "profile") notFound();

  const profile = await (async () => {
    try {
    assertPortfolioDatabaseTarget();
    const revision = await getPreviewRevision(prisma, claims);
    const payload = profileDraftSchema.parse(revision.payload);
    return {
      revisionNumber: revision.revisionNumber,
      profile: toPresentationProfile({
      id: "profile",
      revision: {
        revisionId: revision.revisionId,
        revisionNumber: revision.revisionNumber,
        status: "DRAFT",
        publishedAt: null,
      },
      ...payload,
      }),
    };
    } catch {
      return null;
    }
  })();
  if (!profile) notFound();

  return (
    <>
      <div className="fixed left-0 right-0 top-16 z-40 bg-amber-500 px-4 py-2 text-center text-xs font-bold text-amber-950">
        PRIVATE DRAFT PREVIEW · Revision {profile.revisionNumber} · ไม่แสดงต่อ Search Engine
      </div>
      <Home profile={profile.profile} />
    </>
  );
}
