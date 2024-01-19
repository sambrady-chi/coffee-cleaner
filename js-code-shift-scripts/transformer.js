const path = require("path");

const pather = (p) => path.resolve(__dirname, p);
const findReact = require(pather("./utils/jscodeshift-helpers"));
const replaceDOMFactories = require(pather("./transforms/react-dom-factories-to-react-create-element"));
const convertCreateElementToJsx = require(pather("./transforms/react-create-element-to-jsx"));
const removeModuleExports = require(pather("./transforms/remove-module-exports"));
const replaceCreateComponentWithCreateClass = require(pather("./transforms/replace-create-component-with-react"));
const replaceReturnStatementWithVariableDeclaration = require(pather("./transforms/replace-return-with-variable-declaration"));

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasModifications = false;
  const hasReact = findReact(j, root);

  // Only return the transformed source when we actually have modifications
  // Add other modifications here as we want
  if (hasReact) {
    hasModifications = removeModuleExports(j, root);
    hasModifications =
      replaceDOMFactories(j, root, hasReact) || hasModifications;
    hasModifications = convertCreateElementToJsx(j, root) || hasModifications;
    hasModifications =
      replaceCreateComponentWithCreateClass(j, root) || hasModifications;
    hasModifications =
      replaceReturnStatementWithVariableDeclaration(j, root) ||
      hasModifications;
  }
  return hasModifications ? root.toSource({ quote: "single" }) : null;
}

module.exports = transformer;
