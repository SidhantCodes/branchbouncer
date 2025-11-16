module.exports = {
  id: 'user-public-repos-min',
  description: 'Contributor must have at least N public repos',

  async run(ctx, config) {
    const count = ctx.user.public_repos || 0;
    const min = Number(config.minPublicRepos || 0);

    const passed = count >= min;
    const message = passed
      ? `User has ${count} public repos (min ${min})`
      : `User has only ${count} public repos (needs ≥ ${min})`;

    return {
      id: this.id,
      passed,
      level: 'error',
      message
    };
  }
};
