import type {
  API,
  ASTNode,
  ASTPath,
  Block,
  CommentBlock,
  CommentLine,
  FileInfo,
  Line,
  Node,
  Options,
} from "jscodeshift";

type CommentKind = Block | Line | CommentBlock | CommentLine;

export default function transform(
  file: FileInfo,
  api: API,
  options ? : Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Helper function to preserve comments when replacing nodes
  function replaceWithComments(
    path: ASTPath < ASTNode & { comments ? : CommentKind[] | null } > ,
    newNode: Node,
  ) {
    // If the original node had comments, add them to the new node
    if (path.node.comments) {
      newNode.comments = path.node.comments;
    }

    // Replace the node
    j(path).replaceWith(newNode);
  }

  // Find all variable declarations
  root.find(j.VariableDeclarator).forEach((path) => {
    // Ensure the node is an Identifier and its name is 'toReplace'
    if (
      path.node.id.type === "Identifier" &&
      path.node.id.name === "toReplace"
    ) {
      // Create a new Identifier with the name 'replacement'
      const newId = j.identifier("replacement");

      // Replace the old Identifier with the new one, preserving comments
      replaceWithComments(path.get("id"), newId);
    }
  });

  return root.toSource();
}