// src/cli/protection-prompt.js
const path = require('path');
const inquirer = require('inquirer');
const { getRepoNameFromGit } = require('./git-helper');

async function promptBranchProtection() {
  console.log('\n');
  
  const { enableProtection } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enableProtection',
      message: 'Do you want to enable hard mode branch protection on GitHub?',
      default: false
    }
  ]);

  if (!enableProtection) {
    return null;
  }

  // Try to detect repo info from Git
  const gitInfo = getRepoNameFromGit();
  
  let owner = gitInfo ? gitInfo.owner : '';
  let repo = gitInfo ? gitInfo.repo : path.basename(process.cwd());
  let branch = 'main';

  // Show detected information
  console.log('\n[+] Repository Information:');
  console.log(`    Owner: ${owner || '(not detected)'}`);
  console.log(`    Repository: ${repo}`);
  console.log(`    Branch: ${branch}\n`);

  const { isCorrect } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isCorrect',
      message: 'Is this information correct?',
      default: true
    }
  ]);

  // If user wants to edit, prompt for each field
  if (!isCorrect) {
    const editAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'owner',
        message: '> Repository owner (username or org):',
        default: owner,
        validate: (input) => input.trim().length > 0 || 'Owner is required'
      },
      {
        type: 'input',
        name: 'repo',
        message: '> Repository name:',
        default: repo,
        validate: (input) => input.trim().length > 0 || 'Repository name is required'
      },
      {
        type: 'input',
        name: 'branch',
        message: '> Branch to protect:',
        default: branch
      }
    ]);

    owner = editAnswers.owner.trim();
    repo = editAnswers.repo.trim();
    branch = editAnswers.branch.trim();
  }

  // Now prompt for GitHub token
  console.log('\nYou will need a GitHub Personal Access Token with repo admin rights.');
  console.log('Create one at: https://github.com/settings/tokens\n');

  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: '> GitHub Personal Access Token:',
      mask: '*',
      validate: (input) => input.trim().length > 0 || 'Token is required'
    }
  ]);

  return {
    token: token.trim(),
    owner,
    repo,
    branch
  };
}

async function getProtectionConfig() {
  // Try to detect repo info from Git
  const gitInfo = getRepoNameFromGit();
  
  let owner = gitInfo ? gitInfo.owner : '';
  let repo = gitInfo ? gitInfo.repo : path.basename(process.cwd());
  let branch = 'main';

  // Show detected information
  console.log('[+] Repository Information:');
  console.log(`    Owner: ${owner || '(not detected)'}`);
  console.log(`    Repository: ${repo}`);
  console.log(`    Branch: ${branch}\n`);

  const { isCorrect } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isCorrect',
      message: 'Is this information correct?',
      default: true
    }
  ]);

  // If user wants to edit, prompt for each field
  if (!isCorrect) {
    const editAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'owner',
        message: '> Repository owner (username or org):',
        default: owner,
        validate: (input) => input.trim().length > 0 || 'Owner is required'
      },
      {
        type: 'input',
        name: 'repo',
        message: '> Repository name:',
        default: repo,
        validate: (input) => input.trim().length > 0 || 'Repository name is required'
      },
      {
        type: 'input',
        name: 'branch',
        message: '> Branch to protect:',
        default: branch
      }
    ]);

    owner = editAnswers.owner.trim();
    repo = editAnswers.repo.trim();
    branch = editAnswers.branch.trim();
  }

  // Now prompt for GitHub token
  console.log('\nYou will need a GitHub Personal Access Token with repo admin rights.');
  console.log('Create one at: https://github.com/settings/tokens\n');

  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: '> GitHub Personal Access Token:',
      mask: '*',
      validate: (input) => input.trim().length > 0 || 'Token is required'
    }
  ]);

  return {
    token: token.trim(),
    owner,
    repo,
    branch
  };
}

module.exports = {
  promptBranchProtection,
  getProtectionConfig
};
