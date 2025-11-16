module.exports = {
  id: "account-age-min",
  description: "Contributor account must be at least N days old",

  async run(ctx, config) {
    const createdAt = new Date(ctx.user.created_at);
    const now = new Date();
    const ageDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    const min = Number(config.minAccountAgeDays || 0);

    const passed = ageDays >= min;
    const message = passed
      ? `Account age is ${ageDays.toFixed(1)} days (min ${min})`
      : `Account too new: ${ageDays.toFixed(1)} days (needs ≥ ${min})`;

    return {
      id: this.id,
      passed,
      level: "error",
      message,
    };
  },
};
