import { expect, it } from "vitest";
import { remarkSingleTitle } from "./markdown-headings";
it("retains one document title without changing code fences or existing subsections", () => {
  const tree = { type: "root", children: [{ type: "heading", depth: 1 }, { type: "code", value: "# not a heading" }, { type: "heading", depth: 1 }, { type: "heading", depth: 3 }] };
  remarkSingleTitle()(tree);
  expect(tree.children.map(n => n.depth)).toEqual([1, undefined, 2, 3]);
});

it("adds the CMS title when Markdown contains only paragraphs and code", () => {
  const tree = { type: "root", children: [{ type: "code", value: "# not a heading" }] };
  remarkSingleTitle({ title: "CMS title" })(tree);
  expect(tree.children[0]).toMatchObject({ type: "heading", depth: 1, children: [{ type: "text", value: "CMS title" }] });
});
