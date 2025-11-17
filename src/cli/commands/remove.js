// src/cli/commands/remove.js
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { showBanner } = require('../banner');

async function removeCommand() {
  showBanner();
  console.log('\nRemove BranchBouncer Configuration\n');

  const configPath = path.resolve(process.cwd(), '.branchbouncer.yml');
  const workflowPath = path.resolve(process.cwd(), '.github/workflows/branchbouncer.yml');
  const workflowDir = path.resolve(process.cwd(), '.github/workflows');
  const githubDir = path.resolve(process.cwd(), '.github');

  const configExists = fs.existsSync(configPath);
  const workflowExists = fs.existsSync(workflowPath);

  if (!configExists && !workflowExists) {
    console.log('[!] No BranchBouncer files found in current directory.\n');
    return;
  }

  console.log('[!] The following files will be deleted:');
  if (configExists) {
    console.log(`   - ${path.relative(process.cwd(), configPath)}`);
  }
  if (workflowExists) {
    console.log(`   - ${path.relative(process.cwd(), workflowPath)}`);
  }
  console.log('');

  const { confirmDelete } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmDelete',
      message: 'Are you sure you want to delete these files?',
      default: false
    }
  ]);

  if (!confirmDelete) {
    console.log('\n[+] Deletion cancelled. Files kept.\n');
    return;
  }

  // Delete config file
  if (configExists) {
    fs.unlinkSync(configPath);
    console.log(`[+] Deleted ${path.relative(process.cwd(), configPath)}`);
  }

  // Delete workflow file
  if (workflowExists) {
    fs.unlinkSync(workflowPath);
    console.log(`[+] Deleted ${path.relative(process.cwd(), workflowPath)}`);

    // Check if workflows directory is empty and delete it
    if (fs.existsSync(workflowDir)) {
      const workflowFiles = fs.readdirSync(workflowDir);
      if (workflowFiles.length === 0) {
        fs.rmdirSync(workflowDir);
        console.log(`[+] Deleted empty directory ${path.relative(process.cwd(), workflowDir)}`);

        // Check if .github directory is empty and delete it
        if (fs.existsSync(githubDir)) {
          const githubFiles = fs.readdirSync(githubDir);
          if (githubFiles.length === 0) {
            fs.rmdirSync(githubDir);
            console.log(`[+] Deleted empty directory ${path.relative(process.cwd(), githubDir)}`);
          }
        }
      }
    }
  }

  console.log('\n[+] BranchBouncer files removed successfully!\n');
}

module.exports = { removeCommand };
