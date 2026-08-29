import { describe, expect, it } from "vitest";
import { isSafeMarkdown } from "./markdown-policy";

describe("Markdown safety policy", () => {
  it("allows code examples that contain HTML syntax", () => {
    expect(isSafeMarkdown("```tsx\n<script>alert('example')</script>\n```\n\nGenerics: <T>")).toBe(true);
  });

  it("rejects executable HTML and unsafe links outside code", () => {
    expect(isSafeMarkdown("<script>alert(1)</script>")).toBe(false);
    expect(isSafeMarkdown("[run](javascript:alert(1))")).toBe(false);
    expect(isSafeMarkdown("<a href=\"https://example.com\" onmouseover=\"alert(1)\">link</a>")).toBe(false);
  });
});
