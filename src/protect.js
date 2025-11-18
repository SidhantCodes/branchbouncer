// src/protect.js

/**
 * Enable branch protection on a GitHub repository
 * @param {Object} options
 * @param {string} options.token - GitHub Personal Access Token with repo admin rights
 * @param {string} options.owner - Repository owner (username or organization)
 * @param {string} options.repo - Repository name
 * @param {string} options.branch - Branch to protect (e.g., 'main')
 * @param {string} options.checkName - The GitHub Actions check name (e.g., 'BranchBouncer / validate-pr')
 * @returns {Promise<Object>} GitHub API response
 */
async function enableBranchProtection({ token, owner, repo, branch, checkName }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}/protection`;

  const body = {
    required_status_checks: {
      strict: true,
      contexts: [checkName]
    },
    enforce_admins: false,
    required_pull_request_reviews: {
      required_approving_review_count: 0,
      dismiss_stale_reviews: false,
      require_code_owner_reviews: false,
      require_last_push_approval: false
    },
    restrictions: null,
    required_linear_history: false,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    required_conversation_resolution: false,
    lock_branch: false,
    allow_fork_syncing: true
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'BranchBouncer-CLI'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      `Failed to enable branch protection: ${response.status} ${response.statusText}`
    );
    error.status = response.status;
    error.response = errorData;
    throw error;
  }

  return await response.json();
}

module.exports = { enableBranchProtection };
