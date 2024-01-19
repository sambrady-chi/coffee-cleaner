/*
  Returns an array of destructured elements from ReactLibs.DOMFactories
  eg if the page has const { div, button } = ReactLibs.DOMFactories
  this returns [ 'div', 'button']
  will return empty array if no such items exist.
  */
const findVariablesFromReactLibsDomFactories = (j, root) => {
  const variableDeclarationNodes = root.find(j.VariableDeclarator, {
    init: {
      type: "MemberExpression",
      object: {
        name: "ReactLibs",
      },
      property: {
        name: "DOMFactories",
      },
    },
  }).__paths;

  let variables = [];
  if (variableDeclarationNodes.length) {
    const { value: { id: { properties = [] } } = { value: { id: {} } } } =
      variableDeclarationNodes[0];
    variables = properties.map(
      ({ key: { name } = { key: { name: "" } } }) => name
    );
  }

  return variables;
};

/*
  Returns the Collection object where the JS page destructures ReactLibs.DOMFactories
*/
const findReactLibsDomFactories = (j, root) => {
  // checks for `const { x } = ReactLibs.DOMFactories and returns node
  return root
    .find(j.VariableDeclaration)
    .filter((path = { value: { declarations: [] } }) => {
      const hasReactLibs = path.value.declarations.filter(({ init = {} }) => {
        const {
          type = null,
          object = { name: null },
          property = { name: null },
        } = init;

        if (type && type === "MemberExpression") {
          if (object.name === "ReactLibs" && property.name === "DOMFactories") {
            return true;
          }
        }
      });

      return hasReactLibs.length;
    });
};

// Modifies the variable declarations in the page
const replaceReactLibsDOMFactories = (j, root, hasReact) => {
  const domDestructure = findReactLibsDomFactories(j, root);

  if (!hasReact) {
    // adds `import React from 'react'` (we'll remove it later)
    domDestructure.insertBefore(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("React"))],
        j.literal("react")
      )
    );
  }

  // removes `const { x } = ReactLibs.DOMFactories
  domDestructure.remove();

  // indicates if there were any changes
  return !!domDestructure.length;
};

const replaceDOMFactories = (j, root, hasReact) => {
  const htmlElementsArray = findVariablesFromReactLibsDomFactories(j, root);

  let hasModifications = replaceReactLibsDOMFactories(j, root, hasReact);
  // Check for DOM factories
  // i.e. div(...
  htmlElementsArray.forEach((el) => {
    root
      .find(j.CallExpression, {
        callee: {
          type: "Identifier",
          name: el,
        },
      })
      .replaceWith((path) => {
        hasModifications = true;

        // Set element as first argument for call expression, i.e. DOM.div(... -> 'div'
        path.value.arguments.unshift(j.literal(path.node.callee.name));

        // DOM.div(...) -> React.createElement('div')
        return j.callExpression(
          j.memberExpression(
            j.identifier(hasReact || "React"),
            j.identifier("createElement")
          ),
          path.value.arguments
        );
      });
  });

  return hasModifications;
};

module.exports = replaceDOMFactories;
