# BranchBouncer

BranchBouncer is a configurable GitHub Action and CLI tool designed to protect open source repositories from low-quality or potentially harmful pull requests. It enforces customizable contribution rules to maintain code integrity and reduce maintenance overhead.

It integrates seamlessly into GitHub workflows and provides both automated PR checks and optional automated branch protection enforcement.

---

## Key Features

- Rule-based validation of pull requests
- Configurable policy enforcement through a YAML file
- CLI setup that generates workflow and configuration files
- Automatically blocks pull requests that do not meet policy conditions
- Optional enforcement of GitHub branch protection rules via API
- Compatible with any public or private GitHub repository

---

## Available Validation Rules

BranchBouncer currently supports the following rules:

| Rule ID | Description |
|--------|-------------|
| `account-age-min` | Contributor GitHub account must be older than a specified minimum age |
| `pr-total-changes-min` | Pull request must contain at least a specified number of code changes |
| `user-public-repos-min` | Contributor must maintain a minimum number of public repositories |
| `block-protected-paths` | Prevents modification of specified sensitive file paths |

Additional rules will be added over time. Custom rules may be introduced through contributions.

---

## Installation and Setup

In the root of your repository:

```bash
npx branchbouncer@latest init
````

This command will:

1. Prompt you to select and configure protection rules
2. Create a `.branchbouncer.yml` configuration file
3. Create a GitHub Actions workflow at `.github/workflows/branchbouncer.yml`

Next, commit and push the generated files:

```bash
git add .branchbouncer.yml .github/workflows/branchbouncer.yml
git commit -m "Enable BranchBouncer"
git push
```

Once the workflow has executed at least once on a pull request, configure branch protection.

---

## Enabling Branch Protection (Recommended)

To ensure that failing PRs cannot be merged:

1. Go to **GitHub Repository → Settings → Branches**
2. Create or modify a protection rule for the default branch (e.g., `main`)
3. Enable:

   * Require pull request before merging
   * Require status checks to pass before merging
4. Select the status check:
   **BranchBouncer / validate-pr**

Save the rule.

Alternatively, BranchBouncer can configure protection automatically:

```bash
npx branchbouncer@latest protect
```

This requires a GitHub Personal Access Token with administrative scope.

---

## Updating Rules or Removing Protection

To modify chosen security rules:

```bash
npx branchbouncer@latest init
```

To remove all generated BranchBouncer configuration:

```bash
npx branchbouncer@latest remove-protection
```

You will be prompted to confirm file removal.

---

## How It Works

BranchBouncer acts as a GitHub Action triggered on pull request events. The validation engine fetches:

* Contributor metadata
* Pull Request change statistics
* Modified files list

The supplied rules are evaluated in order. If any rule fails with error severity, the workflow fails and the pull request is blocked.

---

## Configuration

Example `.branchbouncer.yml`:

```yaml
rules:
  - id: account-age-min
    minAccountAgeDays: 730
    enabled: true

  - id: pr-total-changes-min
    minTotalChanges: 500
    enabled: true

  - id: user-public-repos-min
    minPublicRepos: 3
    enabled: true

  - id: block-protected-paths
    blockedPaths:
      - ".github/workflows/**"
    enabled: true
```

---

## Project Structure

BranchBouncer follows a modular architecture for easy maintenance and extensibility:

```
branchbouncer/
├── src/
│   ├── action.js              # GitHub Action entry point
│   ├── cli.js                 # CLI entry point and command router
│   ├── config.js              # Configuration loader and validator
│   ├── protect.js             # GitHub API branch protection
│   ├── cli/                   # CLI modules
│   │   ├── banner.js          # ASCII art and welcome messages
│   │   ├── utils.js           # Shared utilities (loading animations)
│   │   ├── git-helper.js      # Git repository detection
│   │   ├── rules-prompt.js    # Interactive rule selection
│   │   ├── file-manager.js    # Config and workflow file operations
│   │   ├── protection-prompt.js   # Branch protection prompts
│   │   ├── protection-service.js  # Branch protection API calls
│   │   └── commands/          # CLI command implementations
│   │       ├── init.js        # Setup command
│   │       ├── protect.js     # Branch protection command
│   │       ├── remove.js      # Cleanup command
│   │       ├── help.js        # Help text
│   │       └── index.js       # Command exports
│   └── rules/                 # ⭐ Validation rules (add new rules here)
│       ├── index.js           # Rule registry
│       ├── accountAgeMin.js   # Minimum account age rule
│       ├── prTotalChangesMin.js   # Minimum PR changes rule
│       ├── userPublicReposMin.js  # Minimum public repos rule
│       └── blockProtectedPaths.js # Path protection rule
├── dist/                      # Compiled action bundle
├── action.yml                 # GitHub Action metadata
└── package.json
```

### Adding Custom Rules

To add a new validation rule:

1. Create a new file in `src/rules/` (e.g., `myCustomRule.js`)
2. Follow the rule template structure:

```javascript
module.exports = {
  id: 'my-custom-rule',
  description: 'Brief description of what this rule validates',
  
  async validate(context, config) {
    // context.prAuthor - PR author username
    // context.prNumber - PR number
    // context.repoOwner - Repository owner
    // context.repoName - Repository name
    // context.octokit - GitHub API client
    
    // Your validation logic here
    
    if (ruleViolated) {
      return {
        passed: false,
        message: 'Detailed failure message'
      };
    }
    
    return {
      passed: true,
      message: 'Success message'
    };
  }
};
```

3. Register your rule in `src/rules/index.js`:

```javascript
const myCustomRule = require('./myCustomRule');

const ruleRegistry = {
  'my-custom-rule': myCustomRule,
  // ... other rules
};
```

4. Add configuration options in the CLI prompts if needed (`src/cli/rules-prompt.js`)

---

## Contributing

Contributions are welcome. Areas of focus include:

* Additional validation rules
* Enhanced CLI experience
* Rule configuration extensions
* Documentation improvements

Please open an issue or submit a pull request through GitHub.
