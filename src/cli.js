#!/usr/bin/env node

// src/cli.js
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const { ruleRegistry } = require('./rules');

async function promptRules() {
  const ruleChoices = Object.values(ruleRegistry).map(rule => ({
    name: `${rule.id} – ${rule.description}`,
    value: rule.id
  }));

  const { selectedRuleIds } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRuleIds',
      message: 'Select BranchBouncer rules to enable:',
      choices: ruleChoices
    }
  ]);

  const rules = [];

  for (const id of selectedRuleIds) {
    const rule = ruleRegistry[id];

    switch (id) {
      case 'account-age-min': {
        const { minAccountAgeDays } = await inquirer.prompt([
          {
            type: 'number',
            name: 'minAccountAgeDays',
            message: 'Minimum account age in days:',
            default: 730
          }
        ]);
        rules.push({
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
            message: 'Minimum total changes (additions + deletions):',
            default: 500
          }
        ]);
        rules.push({
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
            message: 'Minimum number of public repos:',
            default: 3
          }
        ]);
        rules.push({
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
              'Comma-separated list of protected path globs (e.g. ".github/workflows/**, infra/**"):',
            default: '.github/workflows/**'
          }
        ]);
        const blockedPaths = rawPaths
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        rules.push({
          id,
          enabled: true,
          blockedPaths
        });
        break;
      }

      default:
        rules.push({ id, enabled: true });
    }
  }

  return { rules };
}

function writeConfigFile(config) {
  const configPath = path.resolve(process.cwd(), '.branchbouncer.yml');
  const yamlText = yaml.dump(config, { noRefs: true });

  fs.writeFileSync(configPath, yamlText, 'utf8');
  console.log(`Created ${path.relative(process.cwd(), configPath)}`);
}

function ensureWorkflowFile() {
  const workflowDir = path.resolve(process.cwd(), '.github/workflows');
  const workflowPath = path.join(workflowDir, 'branchbouncer.yml');

  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  if (fs.existsSync(workflowPath)) {
    console.log(`ℹWorkflow already exists at ${path.relative(process.cwd(), workflowPath)} (skipping).`);
    return;
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
  console.log(`Created ${path.relative(process.cwd(), workflowPath)}`);
}

async function main() {
  console.log('BranchBouncer init');

  const { rules } = await promptRules();

  const config = { rules };

  writeConfigFile(config);
  ensureWorkflowFile();

  console.log('\nNext steps:');
  console.log('  1. Commit .branchbouncer.yml and .github/workflows/branchbouncer.yml');
  console.log('  2. Push to GitHub');
  console.log('  3. In repo settings, mark the BranchBouncer check as required for your main branch.');
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
