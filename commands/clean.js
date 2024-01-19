#! /usr/bin/env node
const path = require("path");
const Runner = require("jscodeshift/src/Runner");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const decaffeinate = async (coffeePaths) => {
  const { stdout, stderr } = await exec(
    `decaffeinate ${coffeePaths.join(" ")}`
  );
  console.log("Decaffeinate Success Output:", stdout);
  if (stderr) console.log("Decaffeinate Error Output:", stderr);
};

const clean = (coffeePaths) => {
  decaffeinate(coffeePaths).then(() => {
    const jsPaths = coffeePaths.map((p) => p.replace(".coffee", ".js"));

    /**
     * taken from
     * @link https://github.com/facebook/jscodeshift/blob/48f5d6d6e5e769639b958f1a955c83c68157a5fa/bin/jscodeshift.js#L18
     */
    const options = {
      transform: "./js-code-shift-scripts/transformer.js",
      verbose: 0,
      dry: false, // mark true if you dont want to actually modify the files, just print the output
      print: false, // set to true to print what your new file looks like
      babel: true,
      extensions: "js",
      ignorePattern: [],
      ignoreConfig: [],
      runInBand: false,
      silent: true, // set to false for more output
      parser: "babel",
      stdin: false,
    };

    /**
     * taken from
     * @link https://github.com/facebook/jscodeshift/blob/48f5d6d6e5e769639b958f1a955c83c68157a5fa/bin/jscodeshift.js#L135
     */

    Runner.run(path.resolve(options.transform), jsPaths, options);
    exec(`NODE_ENV="development" cjs-to-es6 ${jsPaths}`);
  });
};

module.exports = clean;
