// src/cli/commands/init.js
const { showBanner } = require('../banner');
const { checkExistingFiles, writeConfigFile, ensureWorkflowFile } = require('../file-manager');
const { promptRules } = require('../rules-prompt');

async function initCommand() {
  showBanner();
  console.log('\nWelcome to BranchBouncer Setup!\n');

  // Check for existing files first
  const shouldContinue = await checkExistingFiles();
  if (!shouldContinue) {
    return;
  }

  const { rules } = await promptRules();

  if (rules.length === 0) {
    console.log('\n[!] No rules selected. Configuration cancelled.');
    return;
  }

  const config = { rules };

  await writeConfigFile(config);
  await ensureWorkflowFile();

  console.log('\n[+] Setup complete!\n');

  console.log('Next steps:');
  console.log('  1. Commit .branchbouncer.yml and .github/workflows/branchbouncer.yml');
  console.log('  2. Push to GitHub');
  console.log('  3. Run "branchbouncer protect" to enable hard mode branch protection');
  console.log('\n[!] Important: Make sure to commit your changes BEFORE enforcing branch protection!\n');
}

module.exports = { initCommand };
