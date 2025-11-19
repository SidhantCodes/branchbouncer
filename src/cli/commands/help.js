// src/cli/commands/help.js

function showHelp() {
  console.log(`
BranchBouncer CLI - Save your repos from spam

Usage:
  branchbouncer [command]

Commands:
  init, -i, --init                          Set up BranchBouncer configuration (default)
  protect, -p, --protect                    Enable hard mode branch protection on GitHub
  remove-protection, -rm, --remove-protection   Remove all BranchBouncer files
  extra                                     Checkout paintnclick.art
  help, -h, --help                          Show this help message

Examples:
  branchbouncer                  # Run initial setup
  branchbouncer init             # Run initial setup
  branchbouncer -i               # Run initial setup (alias)
  branchbouncer protect          # Enable branch protection later
  branchbouncer -p               # Enable branch protection (alias)
  branchbouncer remove-protection # Remove BranchBouncer files
  branchbouncer -rm              # Remove BranchBouncer files (alias)
  branchbouncer extra            # Checkout paintnclick.art
  branchbouncer help             # Show help
  branchbouncer -h               # Show help (alias)

For more information, visit: https://github.com/SidhantCodes/branchbouncer
  `);
}

module.exports = { showHelp };
