const core = require('@actions/core');
const github = require('@actions/github');
const { loadConfig } = require('./config');
const { ruleRegistry, alwaysActiveRules } = require('./rules');

async function buildRuleContext(octokit, context) {
  if (!context.payload.pull_request) {
    throw new Error('BranchBouncer must run on pull_request events');
  }

  const { owner, repo } = context.repo;
  const prNumber = context.payload.pull_request.number;

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber
  });

  const username = pr.user.login;
  const { data: user } = await octokit.rest.users.getByUsername({ username });

  const files = await octokit.paginate(
    octokit.rest.pulls.listFiles,
    { owner, repo, pull_number: prNumber }
  );

  return { pr, user, files, owner, repo, prNumber };
}

async function run() {
  try {
    const token = core.getInput('github_token', { required: true });
    const configPath = core.getInput('config_path') || '.branchbouncer.yml';

    const octokit = github.getOctokit(token);
    const context = github.context;

    const config = loadConfig(configPath);
    const enabledRules = config.rules || [];

    if (enabledRules.length === 0) {
      core.info('No rules enabled in BranchBouncer config, skipping.');
      return;
    }

    const ruleContext = await buildRuleContext(octokit, context);

    const failures = [];

    // First, run always-active rules (these cannot be disabled)
    for (const ruleId of alwaysActiveRules) {
      const ruleDef = ruleRegistry[ruleId];
      
      if (!ruleDef) {
        core.warning(`Always-active rule not found: ${ruleId}`);
        continue;
      }

      const result = await ruleDef.validate(ruleContext);

      // Only log if there's a message (warnings/errors)
      if (result.message) {
        if (result.level === 'warning') {
          core.warning(`[${ruleId}] ${result.message}`);
        } else if (result.level === 'error') {
          core.info(`[${ruleId}] ${result.message}`);
          if (!result.passed) {
            failures.push({ id: ruleId, message: result.message, level: 'error' });
          }
        } else {
          core.info(`[${ruleId}] ${result.message}`);
        }
      }
    }

    // Then, run user-configured rules
    for (const ruleConfig of enabledRules) {
      const id = ruleConfig.id;
      const ruleDef = ruleRegistry[id];

      if (!ruleDef) {
        core.warning(`Unknown rule id in config: ${id}`);
        continue;
      }

      const result = await ruleDef.run(ruleContext, ruleConfig);

      if (result.passed) {
        core.info(`[${result.id}] ${result.message}`);
      } else {
        core.info(`[${result.id}] ${result.message}`);
        if (result.level === 'error') {
          failures.push(result);
        }
      }
    }

    if (failures.length > 0) {
      const messages = failures.map(f => `[${f.id}] ${f.message}`).join('\n');
      core.setFailed(`BranchBouncer failed:\n${messages}`);
    } else {
      core.info('All BranchBouncer rules passed ✅');
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
