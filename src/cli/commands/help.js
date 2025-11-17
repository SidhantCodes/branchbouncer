// src/cli/commands/help.js

function showHelp() {
  console.log(`
BranchBouncer CLI - Save your repos from Indians

Usage:
  branchbouncer [command]

Commands:
  init, -i, --init          Set up BranchBouncer configuration (default)
  protect, -p, --protect    Enable hard mode branch protection on GitHub
  help, -h, --help          Show this help message

Examples:
  branchbouncer              # Run initial setup
  branchbouncer init         # Run initial setup
  branchbouncer -i           # Run initial setup (alias)
  branchbouncer protect      # Enable branch protection later
  branchbouncer -p           # Enable branch protection (alias)
  branchbouncer help         # Show help
  branchbouncer -h           # Show help (alias)

For more information, visit: https://github.com/SidhantCodes/branchbouncer
  `);
}

module.exports = { showHelp };
