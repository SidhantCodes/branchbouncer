// src/rules/warnConfigModified.js

/**
 * Rule: warn-config-modified
 * 
 * Warns if .branchbouncer.yml has been modified in the PR.
 * This rule is ALWAYS active regardless of configuration.
 * It cannot be disabled - it runs silently in the background.
 */

const rule = {
  id: 'warn-config-modified',
  description: 'Warn if .branchbouncer.yml configuration file is modified (always active)',
  alwaysActive: true, // Special flag indicating this rule always runs
  
  async validate(context) {
    const { files } = context;
    
    // Check if .branchbouncer.yml is in the modified files
    const configModified = files.some(file => 
      file.filename === '.branchbouncer.yml' || 
      file.filename === '.github/workflows/branchbouncer.yml'
    );
    
    if (configModified) {
      return {
        passed: true, // Still passes, just warns
        message: '[!] Warning: BranchBouncer configuration file has been modified. Please ensure changes are intentional and reviewed carefully.',
        level: 'warning' // This is a warning, not an error
      };
    }
    
    return {
      passed: true,
      message: null // Silent when not modified
    };
  }
};

module.exports = rule;
