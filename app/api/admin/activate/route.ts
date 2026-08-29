import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { isSameOrigin } from "@/server/csrf";

const activationSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(12).max(200),
});

function matchesToken(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "CSRF", message: "Origin validation failed" } }, { status: 403 });
  const expectedToken = process.env.ADMIN_ACTIVATION_TOKEN;
  const configuredEmail = process.env.ADMIN_EMAIL;
  if (!expectedToken || !configuredEmail) return NextResponse.json({ error: { code: "NOT_CONFIGURED", message: "Activation is unavailable" } }, { status: 404 });

  const parsed = activationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.email.toLowerCase() !== configuredEmail.toLowerCase() || !matchesToken(parsed.data.token, expectedToken)) {
    return NextResponse.json({ error: { code: "INVALID_ACTIVATION", message: "Activation details are invalid" } }, { status: 401 });
  }
  if (await prisma.user.findUnique({ where: { email: configuredEmail }, select: { id: true } })) {
    return NextResponse.json({ error: { code: "ALREADY_ACTIVATED", message: "Administrator is already activated" } }, { status: 409 });
  }

  try {
    await getAuth({ allowSignUp: true }).api.signUpEmail({
      body: { name: parsed.data.name, email: configuredEmail, password: parsed.data.password },
      headers: request.headers,
    });
    return NextResponse.json({ ok: true, message: "Administrator activated. Remove ADMIN_ACTIVATION_TOKEN now." });
  } catch {
    return NextResponse.json({ error: { code: "ACTIVATION_FAILED", message: "Administrator activation failed" } }, { status: 400 });
  }
}
