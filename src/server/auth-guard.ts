import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getAuth } from "./auth";

export async function getAdminSession() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user || user.role !== "admin") return null;
  return { session, user };
}

export async function requireAdminPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireAdminApi() {
  return getAdminSession();
}
