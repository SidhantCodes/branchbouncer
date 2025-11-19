// Always-active rule that warns when BranchBouncer config files are modified
const rule = {
  id: 'warn-config-modified',
  description: 'Warn if .branchbouncer.yml configuration file is modified (always active)',
  alwaysActive: true,

  async validate(context) {
    const { files } = context;

    // Check if config or workflow file is modified
    const configModified = files.some(
      file =>
        file.filename === '.branchbouncer.yml' ||
        file.filename === '.github/workflows/branchbouncer.yml'
    );

    if (configModified) {
      return {
        passed: true,
        message:
          '⚠️ Warning: This PR modifies the BranchBouncer configuration file (.branchbouncer.yml) or workflow. Please ensure this change is intentional and has been reviewed.',
        level: 'warning'
      };
    }

    return { passed: true, message: null };
  }
};

module.exports = rule;
