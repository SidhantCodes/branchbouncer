module.exports = {
  id: 'pr-total-changes-min',
  description: 'PR must have at least N total changes (additions + deletions)',

  async run(ctx, config) {
    const total = (ctx.pr.additions || 0) + (ctx.pr.deletions || 0);
    const min = Number(config.minTotalChanges || 0);

    const passed = total >= min;
    const message = passed
      ? `Total changes is ${total} (min ${min})`
      : `PR too small: ${total} changes (needs ≥ ${min})`;

    return {
      id: this.id,
      passed,
      level: 'error',
      message
    };
  }
};
