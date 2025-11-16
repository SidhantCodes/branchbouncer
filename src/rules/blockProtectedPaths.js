const micromatch = require('micromatch');

module.exports = {
  id: 'block-protected-paths',
  description: 'Disallow changes in protected paths',

  async run(ctx, config) {
    const blocked = config.blockedPaths || [];
    const changedFiles = ctx.files.map(f => f.filename);

    const matches = micromatch(changedFiles, blocked);

    const passed = matches.length === 0;
    const message = passed
      ? 'No protected paths modified'
      : `Protected paths modified: ${matches.join(', ')}`;

    return {
      id: this.id,
      passed,
      level: 'error',
      message
    };
  }
};
