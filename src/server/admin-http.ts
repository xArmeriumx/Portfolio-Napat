import { NextResponse } from "next/server";
import { ContentConflictError, ContentNotFoundError } from "@/content/admin-service";

export function adminErrorResponse(error: unknown) {
  if (error instanceof ContentNotFoundError) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: error.message } }, { status: 404 });
  }
  if (error instanceof ContentConflictError) {
    return NextResponse.json({ error: { code: "CONFLICT", message: error.message } }, { status: 409 });
  }
  if (error instanceof Error && error.message === "CONTENT_VALIDATION_ERROR") {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "ตรวจสอบข้อมูลที่กรอกอีกครั้ง", details: (error as Error & { details?: unknown }).details } }, { status: 422 });
  }
  const mediaValidationMessages = new Set(["MEDIA_TOO_LARGE", "MEDIA_SIGNATURE_MISMATCH", "UNSUPPORTED_MEDIA_TYPE"]);
  if (error instanceof Error && mediaValidationMessages.has(error.message)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "รองรับเฉพาะภาพ PNG, JPEG หรือ WebP ขนาดไม่เกิน 10 MB" } }, { status: 422 });
  }
  if (error instanceof Error && error.message === "STORAGE_UPLOAD_FAILED") {
    return NextResponse.json({ error: { code: "STORAGE_UNAVAILABLE", message: "พื้นที่จัดเก็บ Media ไม่พร้อมใช้งาน" } }, { status: 502 });
  }
  console.error("[admin] request failed", error instanceof Error ? error.message : "unknown error");
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดชั่วคราว" } }, { status: 500 });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "ต้องเข้าสู่ระบบผู้ดูแลก่อน" } }, { status: 401 });
}
