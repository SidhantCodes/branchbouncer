// src/cli/commands/index.js

const { initCommand } = require('./init');
const { protectCommand } = require('./protect');
const { showHelp } = require('./help');

module.exports = {
  initCommand,
  protectCommand,
  showHelp
};
