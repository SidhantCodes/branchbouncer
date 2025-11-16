const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadConfig(configPathFromInput) {
  const configPath = configPathFromInput || '.branchbouncer.yml';
  const absPath = path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(absPath)) {
    throw new Error(`BranchBouncer config file not found at ${configPath}`);
  }

  const file = fs.readFileSync(absPath, 'utf8');
  const config = yaml.load(file) || {};

  if (!Array.isArray(config.rules)) {
    throw new Error('Invalid config: "rules" must be an array');
  }

  config.rules = config.rules.filter(r => r && r.enabled !== false);

  return config;
}

module.exports = {
  loadConfig
};
