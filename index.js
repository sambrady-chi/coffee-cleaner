#!/usr/bin/env node

const { program } = require("commander");
const clean = require("./commands/clean");

program
  .command("clean <coffeePaths...>")
  .description("Basic clean command to convert coffee to js")
  .action(clean);

program.parse();
