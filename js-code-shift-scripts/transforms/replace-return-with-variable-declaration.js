const replaceReturnStatementWithVariableDeclaration = (j, root, hasReact) => {
  // fetch return statement (eg `return React.createClass("HiClass", ...)`)
  const returnStatementCollection = root.find(j.ReturnStatement, {
    argument: {
      type: "CallExpression",
      callee: {
        object: {
          name: "React",
        },
        property: {
          name: "createClass",
        },
      },
    },
  });

  let className;

  // Replace return statement with variable declaration ( const HiClass = React.createClass("HiClass", ...))
  returnStatementCollection.replaceWith((path) => {
    const {
      node: { argument },
    } = path;

    className = Array.from(argument.arguments).find(
      (a) => a.type === "Literal"
    ).value;
    const variableNode = j.variableDeclaration("const", [
      j.variableDeclarator(
        j.identifier(className),
        j.callExpression(argument.callee, argument.arguments)
      ),
    ]);

    return variableNode;
  });

  // add "export default HiClass" to to the bottom of the file

  const fileBody = root.get().node.program.body;
  fileBody.push(j.exportDefaultDeclaration(j.identifier(className)));

  return true;
};

module.exports = replaceReturnStatementWithVariableDeclaration;
