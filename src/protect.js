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
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 0
    },
    restrictions: null
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
