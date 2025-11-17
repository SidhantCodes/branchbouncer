// src/cli/protection-service.js
const { enableBranchProtection } = require('../protect');
const { showLoadingAnimation } = require('./utils');

async function applyBranchProtection(protectionConfig) {
  const stopLoading = showLoadingAnimation('Enabling branch protection on GitHub...');

  try {
    await enableBranchProtection({
      token: protectionConfig.token,
      owner: protectionConfig.owner,
      repo: protectionConfig.repo,
      branch: protectionConfig.branch,
      checkName: 'BranchBouncer / validate-pr'
    });

    stopLoading();
    console.log(`[+] Branch protection enabled for ${protectionConfig.owner}/${protectionConfig.repo}:${protectionConfig.branch}`);
  } catch (error) {
    stopLoading();
    console.error(`\n[!] Failed to enable branch protection: ${error.message}`);
    
    if (error.response) {
      console.error('[!] GitHub API response:', JSON.stringify(error.response, null, 2));
    }
    
    console.log('\nYou can enable branch protection manually in your GitHub repository settings.');
  }
}

module.exports = { applyBranchProtection };
