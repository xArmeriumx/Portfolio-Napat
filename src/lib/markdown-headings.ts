type MarkdownNode = { type: string; depth?: number; children?: MarkdownNode[]; value?: string };
// Preserve the first document title, demote subsequent top-level headings.
// Code fences are AST code nodes and remain untouched.
export function remarkSingleTitle(options: { title?: string } = {}) {
  return (tree: MarkdownNode) => {
    let titleSeen = false;
    function walk(node: MarkdownNode) {
      if (node.type === "heading" && node.depth === 1) {
        if (titleSeen) node.depth = 2;
        titleSeen = true;
      }
      node.children?.forEach(walk);
    }
    walk(tree);
    if (!titleSeen && options.title) {
      tree.children ||= [];
      tree.children.unshift({ type: "heading", depth: 1, children: [{ type: "text", value: options.title }] });
    }
  };
}
