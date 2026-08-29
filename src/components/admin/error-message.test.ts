import { describe, expect, it } from "vitest";
import { formatAdminError } from "./error-message";

describe("admin validation messages", () => {
  it("includes server-side field details in the editor error", () => {
    const error = Object.assign(new Error("ตรวจสอบข้อมูลที่กรอกอีกครั้ง"), {
      details: {
        contact: ["Invalid URL"],
        skillCategories: ["Required"],
      },
    });

    expect(formatAdminError(error)).toBe("ตรวจสอบข้อมูลที่กรอกอีกครั้ง — contact: Invalid URL; skillCategories: Required");
  });

  it("keeps a safe generic message when no field details exist", () => {
    expect(formatAdminError(new Error("คำขอไม่สำเร็จ"))).toBe("คำขอไม่สำเร็จ");
  });
});
