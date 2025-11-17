#!/usr/bin/env node

// src/cli.js
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const figlet = require('figlet');
const { ruleRegistry } = require('./rules');
const { enableBranchProtection } = require('./protect');

// Loading animation
function showLoadingAnimation(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);

  return () => {
    clearInterval(interval);
    process.stdout.write('\r\x1b[K'); // Clear the line
  };
}

// Categorize rules
function categorizeRules() {
  const categories = {
    'User Account Rules': [],
    'Pull Request Rules': [],
    'Security Rules': [],
    'Other Rules': []
  };

  for (const rule of Object.values(ruleRegistry)) {
    if (rule.id.includes('account-age') || rule.id.includes('user-public-repos')) {
      categories['User Account Rules'].push(rule);
    } else if (rule.id.includes('pr-') || rule.id.includes('commit-')) {
      categories['Pull Request Rules'].push(rule);
    } else if (rule.id.includes('block-') || rule.id.includes('protected')) {
      categories['Security Rules'].push(rule);
    } else {
      categories['Other Rules'].push(rule);
    }
  }

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([_, rules]) => rules.length > 0)
  );
}

async function promptRules() {
  const categorizedRules = categorizeRules();
  const allSelectedRules = [];

  console.log('\nConfigure BranchBouncer rules by category\n');

  for (const [category, rules] of Object.entries(categorizedRules)) {
    // Display category with line break
    console.log(`\n${category}:`);
    console.log('(Press <space> to select, <a> to toggle all, <i> to invert selection)\n');
    
    const ruleChoices = rules.map(rule => ({
      name: `${rule.id} – ${rule.description}`,
      value: rule.id
    }));

    const { selectedRuleIds } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedRuleIds',
        message: 'Select rules:',
        choices: ruleChoices,
        pageSize: 15,
        loop: false
      }
    ]);

    // Process selected rules from this category
    for (const id of selectedRuleIds) {
      const rule = ruleRegistry[id];

      switch (id) {
        case 'account-age-min': {
          const { minAccountAgeDays } = await inquirer.prompt([
            {
              type: 'number',
              name: 'minAccountAgeDays',
              message: '  > Minimum account age in days:',
              default: 730
            }
          ]);
          allSelectedRules.push({
            id,
            enabled: true,
            minAccountAgeDays
          });
          break;
        }

        case 'pr-total-changes-min': {
          const { minTotalChanges } = await inquirer.prompt([
            {
              type: 'number',
              name: 'minTotalChanges',
              message: '  > Minimum total changes (additions + deletions):',
              default: 500
            }
          ]);
          allSelectedRules.push({
            id,
            enabled: true,
            minTotalChanges
          });
          break;
        }

        case 'user-public-repos-min': {
          const { minPublicRepos } = await inquirer.prompt([
            {
              type: 'number',
              name: 'minPublicRepos',
              message: '  > Minimum number of public repos:',
              default: 3
            }
          ]);
          allSelectedRules.push({
            id,
            enabled: true,
            minPublicRepos
          });
          break;
        }

        case 'block-protected-paths': {
          const { rawPaths } = await inquirer.prompt([
            {
              type: 'input',
              name: 'rawPaths',
              message:
                '  > Comma-separated list of protected path globs (e.g. ".github/workflows/**, infra/**"):',
              default: '.github/workflows/**'
            }
          ]);
          const blockedPaths = rawPaths
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

          allSelectedRules.push({
            id,
            enabled: true,
            blockedPaths
          });
          break;
        }

        default:
          allSelectedRules.push({ id, enabled: true });
      }
    }
  }

  return { rules: allSelectedRules };
}

async function checkExistingFiles() {
  const configPath = path.resolve(process.cwd(), '.branchbouncer.yml');
  const workflowPath = path.resolve(process.cwd(), '.github/workflows/branchbouncer.yml');

  const configExists = fs.existsSync(configPath);
  const workflowExists = fs.existsSync(workflowPath);

  if (configExists || workflowExists) {
    console.log('\n[!] Existing BranchBouncer files detected:');
    if (configExists) {
      console.log(`   - ${path.relative(process.cwd(), configPath)}`);
    }
    if (workflowExists) {
      console.log(`   - ${path.relative(process.cwd(), workflowPath)}`);
    }

    const { shouldReplace } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldReplace',
        message: 'Do you want to replace these files with new configuration?',
        default: false
      }
    ]);

    if (!shouldReplace) {
      console.log('\n[+] Keeping existing files. CLI terminated.');
      return false;
    }

    console.log('\n[+] Proceeding to create new configuration...\n');
  }

  return true;
}

async function writeConfigFile(config) {
  const stopLoading = showLoadingAnimation('Generating configuration file...');
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const configPath = path.resolve(process.cwd(), '.branchbouncer.yml');
  const yamlText = yaml.dump(config, { noRefs: true });

  fs.writeFileSync(configPath, yamlText, 'utf8');
  
  stopLoading();
  console.log(`[+] Created ${path.relative(process.cwd(), configPath)}`);
}

async function ensureWorkflowFile() {
  const stopLoading = showLoadingAnimation('Setting up GitHub workflow...');
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const workflowDir = path.resolve(process.cwd(), '.github/workflows');
  const workflowPath = path.join(workflowDir, 'branchbouncer.yml');

  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  const workflowYaml = `name: BranchBouncer

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  validate-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run BranchBouncer
        uses: SidhantCodes/branchbouncer@v1
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          config_path: ".branchbouncer.yml"
`;

  fs.writeFileSync(workflowPath, workflowYaml, 'utf8');
  
  stopLoading();
  console.log(`[+] Created ${path.relative(process.cwd(), workflowPath)}`);
}

function getRepoNameFromGit() {
  try {
    const gitConfigPath = path.resolve(process.cwd(), '.git', 'config');
    
    if (!fs.existsSync(gitConfigPath)) {
      return null;
    }

    const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
    
    // Match GitHub remote URL patterns
    // git@github.com:owner/repo.git OR https://github.com/owner/repo.git
    const sshMatch = gitConfig.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?[\s\n]/);
    const httpsMatch = gitConfig.match(/github\.com\/([^/]+)\/(.+?)(?:\.git)?[\s\n]/);
    
    const match = sshMatch || httpsMatch;
    
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

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

async function main() {
   
     console.log(`
                   \\_________________/
                   |       | |       |
                   |       | |       |
                   |       | |       |
                   |_______| |_______|
                   |_______   _______|
                   |    B R A N C H  |
                   |   B O U N C E R |
                    \\      | |      /
                     \\     | |     /
                      \\    | |    /
                       \\   | |   /
                        \\  | |  /
                         \\ | | /
                          \\| |/
                           \\_/
  `);
    console.log(figlet.textSync('BranchBouncer', {
    font: 'Doom',
    horizontalLayout: 'default'
  }));

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
    console.log('  3. In repo settings, mark the BranchBouncer check as required for your main branch.');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
