const findReact = (j, root) => {
  // Check for import
  // i.e. `import React from 'react'`
  let hasReactImport = Array.from(
    root.find(j.ImportDeclaration, {
      source: {
        value: "react",
      },
    }).__paths
  ).find(({ node }) => {
    return node.specifiers[0].local.name;
  });

  hasReactImport =
    hasReactImport && hasReactImport.node.specifiers[0].local.name;

  // Check for require
  // i.e. `const React = require('react')`
  let hasReactRequire = Array.from(
    root.find(j.VariableDeclarator, {
      init: {
        type: "CallExpression",
        callee: {
          name: "require",
        },
      },
    }).__paths
  ).find(({ node }) => {
    return node.init.arguments[0].value === "react" && node.id.name;
  });

  hasReactRequire = hasReactRequire && hasReactRequire.node.id.name;

  return hasReactImport || hasReactRequire;
};

module.exports = findReact;
