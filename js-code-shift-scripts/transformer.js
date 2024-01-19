const findReact = require("./utils/jscodeshift-helpers");
const replaceDOMFactories = require("./transforms/react-dom-factories-to-react-create-element");
const convertCreateElementToJsx = require("./transforms/react-create-element-to-jsx");
const removeModuleExports = require("./transforms/remove-module-exports");
const replaceCreateComponentWithCreateClass = require("./transforms/replace-create-component-with-react");
const replaceReturnStatementWithVariableDeclaration = require("./transforms/replace-return-with-variable-declaration");

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasModifications = false;
  const hasReact = findReact(j, root);

  // Only return the transformed source when we actually have modifications
  // Add other modifications here as we want
  if (hasReact) {
    hasModifications = removeModuleExports(j, root);
    hasModifications = replaceDOMFactories(j, root, hasReact) || hasModifications;
    hasModifications = convertCreateElementToJsx(j, root) || hasModifications;
    hasModifications = replaceCreateComponentWithCreateClass(j, root) || hasModifications;
    hasModifications = replaceReturnStatementWithVariableDeclaration(j, root) || hasModifications;
  }
  return hasModifications ? root.toSource({ quote: "single" }) : null;
}

module.exports = transformer;
