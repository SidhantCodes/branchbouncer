// src/cli/commands/protect.js
const fs = require('fs');
const path = require('path');
const { showBanner } = require('../banner');
const { getProtectionConfig } = require('../protection-prompt');
const { applyBranchProtection } = require('../protection-service');

async function protectCommand() {
  showBanner();
  console.log('\nBranch Protection Setup\n');

  // Check if config exists
  const configPath = path.resolve(process.cwd(), '.branchbouncer.yml');
  if (!fs.existsSync(configPath)) {
    console.log('[!] No .branchbouncer.yml found in current directory.');
    console.log('[!] Please run "branchbouncer init" first to set up BranchBouncer.\n');
    return;
  }

  console.log('[+] Found .branchbouncer.yml configuration\n');

  // Red warning about committing changes
  console.log('\x1b[31m[WARNING] Make sure you have committed all your changes before enforcing branch protection!\x1b[0m \n');

  const protectionConfig = await getProtectionConfig();
  await applyBranchProtection(protectionConfig);
}

module.exports = { protectCommand };
