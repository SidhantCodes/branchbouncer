const PROTECTED_FILES = [
  '.branchbouncer.yml',
  '.github/workflows/branchbouncer.yml'
];

module.exports = {
  id: 'config-edit-protection',
  description:
    'Protects BranchBouncer config and workflow files from edits by untrusted users',

  async run(ctx, config) {
    const changedFiles = (ctx.files || []).map(f => f.filename);
    const touchedProtected = changedFiles.filter(f =>
      PROTECTED_FILES.includes(f)
    );

    // If no protected files were touched, nothing to enforce
    if (touchedProtected.length === 0) {
      return {
        id: this.id,
        passed: true,
        level: 'error',
        message: 'No BranchBouncer config files modified'
      };
    }

    const authorLogin =
      (ctx.user && ctx.user.login ? ctx.user.login : '').toLowerCase();
    const repoOwner = (ctx.owner || '').toLowerCase();

    const allowedEditors = Array.isArray(config.allowedConfigEditors)
      ? config.allowedConfigEditors.map(name => String(name).toLowerCase())
      : [];

    const isOwner = authorLogin && authorLogin === repoOwner;
    const isExplicitlyAllowed =
      authorLogin && allowedEditors.includes(authorLogin);

    const passed = isOwner || isExplicitlyAllowed;

    const fileList = touchedProtected.join(', ');
    const baseMessage = `BranchBouncer protected files modified: ${fileList} by @${ctx.user.login}`;

    if (passed) {
      return {
        id: this.id,
        passed: true,
        level: 'error',
        message: `${baseMessage} (user is repo owner or listed in allowedConfigEditors)`
      };
    }

    return {
      id: this.id,
      passed: false,
      level: 'error',
      message:
        `${baseMessage}. This is not allowed. ` +
        `Only the repo owner (${ctx.owner}) or users listed in "allowedConfigEditors" in .branchbouncer.yml may modify these files.`
    };
  }
};
