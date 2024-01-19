const replaceCreateComponentWithCreateClass = (j, root, hasReact) => {
  // FIND "createComponent"
  const nodes = root.find(j.CallExpression, {
    callee: {
      type: "Identifier",
      name: "createComponent",
    },
  });

  // REPLACE it with "React.createClass"
  if (nodes.__paths) {
    nodes.replaceWith((path) => {
      return j.callExpression(
        j.memberExpression(j.identifier("React"), j.identifier("createClass")),
        path.value.arguments
      );
    });

    return true;
  }
};

module.exports = replaceCreateComponentWithCreateClass;
