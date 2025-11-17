// src/cli/commands/init.js
const { showBanner } = require('../banner');
const { checkExistingFiles, writeConfigFile, ensureWorkflowFile } = require('../file-manager');
const { promptRules } = require('../rules-prompt');
const { promptBranchProtection } = require('../protection-prompt');
const { applyBranchProtection } = require('../protection-service');

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

  // Prompt for branch protection
  const protectionConfig = await promptBranchProtection();
  
  if (protectionConfig) {
    await applyBranchProtection(protectionConfig);
  }

  console.log('\nNext steps:');
  console.log('  1. Commit .branchbouncer.yml and .github/workflows/branchbouncer.yml');
  console.log('  2. Push to GitHub');
  
  if (!protectionConfig) {
    console.log('  3. Run "branchbouncer protect" later to enable hard mode branch protection');
  }
}

module.exports = { initCommand };
