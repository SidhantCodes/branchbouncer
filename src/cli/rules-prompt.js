// src/cli/rules-prompt.js
const inquirer = require('inquirer');
const { ruleRegistry, alwaysActiveRules } = require('../rules');

// Categorize rules
function categorizeRules() {
  const categories = {
    'User Account Rules': [],
    'Pull Request Rules': [],
    'Security Rules': [],
    'Other Rules': []
  };

  for (const rule of Object.values(ruleRegistry)) {
    // Skip always-active rules - they run automatically
    if (alwaysActiveRules.includes(rule.id)) {
      continue;
    }

    if (rule.id.includes('account-age') || rule.id.includes('user-public-repos')) {
      categories['User Account Rules'].push(rule);
    } else if (rule.id.includes('pr-') || rule.id.includes('commit-')) {
      categories['Pull Request Rules'].push(rule);
    } else if (rule.id.includes('block-') || rule.id.includes('protected')) {
      categories['Security Rules'].push(rule);
    } else {
      categories['Other Rules'].push(rule);
    }
  }

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([_, rules]) => rules.length > 0)
  );
}

async function promptRules() {
  const categorizedRules = categorizeRules();
  const allSelectedRules = [];

  console.log('\nConfigure BranchBouncer rules by category\n');

  for (const [category, rules] of Object.entries(categorizedRules)) {
    // Display category with line break
    console.log(`\n${category}:`);
    console.log('(Press <space> to select, <a> to toggle all, <i> to invert selection)\n');
    
    const ruleChoices = rules.map(rule => ({
      name: `${rule.id} – ${rule.description}`,
      value: rule.id
    }));

    const { selectedRuleIds } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedRuleIds',
        message: 'Select rules:',
        choices: ruleChoices,
        pageSize: 15,
        loop: false
      }
    ]);

    // Process selected rules from this category
    for (const id of selectedRuleIds) {
      const rule = ruleRegistry[id];

      switch (id) {
        case 'account-age-min': {
          const { minAccountAgeDays } = await inquirer.prompt([
            {
              type: 'number',
              name: 'minAccountAgeDays',
              message: '  > Minimum account age in days:',
              default: 730
            }
          ]);
          allSelectedRules.push({
            id,
            enabled: true,
            minAccountAgeDays
          });
          break;
        }

        case 'pr-total-changes-min': {
          const { minTotalChanges } = await inquirer.prompt([
            {
              type: 'number',
              name: 'minTotalChanges',
              message: '  > Minimum total changes (additions + deletions):',
              default: 500
            }
          ]);
          allSelectedRules.push({
            id,
            enabled: true,
            minTotalChanges
          });
          break;
        }

        case 'user-public-repos-min': {
          const { minPublicRepos } = await inquirer.prompt([
            {
              type: 'number',
              name: 'minPublicRepos',
              message: '  > Minimum number of public repos:',
              default: 3
            }
          ]);
          allSelectedRules.push({
            id,
            enabled: true,
            minPublicRepos
          });
          break;
        }

        case 'block-protected-paths': {
          const { rawPaths } = await inquirer.prompt([
            {
              type: 'input',
              name: 'rawPaths',
              message:
                '  > Comma-separated list of protected path globs (e.g. ".github/workflows/**, infra/**"):',
              default: '.github/workflows/**'
            }
          ]);
          const blockedPaths = rawPaths
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

          allSelectedRules.push({
            id,
            enabled: true,
            blockedPaths
          });
          break;
        }

        default:
          allSelectedRules.push({ id, enabled: true });
      }
    }
  }

  return { rules: allSelectedRules };
}

module.exports = { promptRules };
