const core = require('@actions/core');
const github = require('@actions/github');
const { loadConfig } = require('./config');
const { ruleRegistry } = require('./rules');

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
