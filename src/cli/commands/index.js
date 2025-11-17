// src/cli/commands/index.js

const { initCommand } = require('./init');
const { protectCommand } = require('./protect');
const { removeCommand } = require('./remove');
const { showHelp } = require('./help');

module.exports = {
  initCommand,
  protectCommand,
  removeCommand,
  showHelp
};
