#!/usr/bin/env node

// src/cli.js
const { initCommand, protectCommand, removeCommand, showHelp } = require('./cli/commands');

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
    
    case 'remove-protection':
    case '-rm':
    case '--remove-protection':
      await removeCommand();
      break;
    
    case 'extra':
      console.log('\nCheckout paintnclick.art');
      console.log('Follow @paint.n.click on Instagram\n');
      break;
    case 'whomadeyou':
      console.log('\nBranchBouncer was created by:');
      console.log('Sidhant: @_sidhant22');
      console.log('Aditya: @oye.ranjan\n');
      console.log('Check them out on instagram\n');
      break;
    
    case 'poem':
      console.log('\nYou can defend your repo');
      console.log('but you can not change your start');
      console.log('men can defend their code');
      console.log('but never their broken heart\n');
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
