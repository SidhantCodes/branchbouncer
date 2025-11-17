// src/cli/git-helper.js
const fs = require('fs');
const path = require('path');

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

module.exports = { getRepoNameFromGit };
