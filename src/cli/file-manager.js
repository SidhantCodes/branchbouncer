// src/cli/file-manager.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');
const { showLoadingAnimation } = require('./utils');

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

  const workflowYaml = `

name: BranchBouncer

permissions:
  contents: read
  pull-requests: read
  checks: write

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

module.exports = {
  checkExistingFiles,
  writeConfigFile,
  ensureWorkflowFile
};
