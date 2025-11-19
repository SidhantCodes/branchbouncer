const accountAgeMin = require('./accountAgeMin');
const prTotalChangesMin = require('./prTotalChangesMin');
const userPublicReposMin = require('./userPublicReposMin');
const blockProtectedPaths = require('./blockProtectedPaths');
const warnConfigModified = require('./warnConfigModified');

const ruleRegistry = {
  [accountAgeMin.id]: accountAgeMin,
  [prTotalChangesMin.id]: prTotalChangesMin,
  [userPublicReposMin.id]: userPublicReposMin,
  [blockProtectedPaths.id]: blockProtectedPaths,
  [warnConfigModified.id]: warnConfigModified
};

// Rules that always run, regardless of user configuration
const alwaysActiveRules = ['warn-config-modified'];

module.exports = {
  ruleRegistry,
  alwaysActiveRules
};
