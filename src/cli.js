#!/usr/bin/env node

// src/cli.js
const { initCommand, protectCommand, showHelp } = require('./cli/commands');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  switch (command) {
    case 'init':
    case '-i':
    case '--init':
      await initCommand();
      break;
    
    case 'protect':
    case '-p':
    case '--protect':
      await protectCommand();
      break;
    
    case 'help':
    case '-h':
    case '--help':
      showHelp();
      break;
    
    default:
      console.log(`[!] Unknown command: ${command}`);
      console.log('[!] Run "branchbouncer help" for usage information\n');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
