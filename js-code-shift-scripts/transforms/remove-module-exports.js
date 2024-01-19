const removeModuleExports = (j, root, hasReact) => {
  // FETCH THE "ROOT" NODE (OUTERMOST NODE ON FILE)
  const fileProgram = root.get().node.program;

  // ----------------------------------------------------------------- REPLACE

  // FETCH THE "FUNCTION" NODE (where we call module.exports = (function() ... ))
  const functionExpressionCollection = root.find(j.ExpressionStatement, {
    expression: {
      left: {
        object: {
          name: "module",
        },
        property: {
          name: "exports",
        },
      },
      right: {
        callee: {
          type: "FunctionExpression",
        },
      },
      operator: "=",
    },
  });

  // export default(function() )
  const functionExportDefaultCollection = root.find(
    j.ExportDefaultDeclaration,
    {
      declaration: {
        callee: {
          type: "FunctionExpression",
        },
      },
    }
  );

  if (Array.from(functionExpressionCollection.__paths).length > 0) {
    const functionExpressionNode = functionExpressionCollection.get(0).node;

    // get the "body" of the function
    const functionBody =
      functionExpressionNode.expression.right.callee.body.body;
    // set it to the "body" of the file
    fileProgram.body = functionBody;

    return true;
  }
  if (Array.from(functionExportDefaultCollection.__paths).length > 0) {
    const functionExpressionNode = functionExportDefaultCollection.get(0).node;

    // get the "body" of the function
    const functionBody = functionExpressionNode.body.body;
    // set it to the "body" of the file
    fileProgram.body = functionBody;

    return true;
  }
};

module.exports = removeModuleExports;
