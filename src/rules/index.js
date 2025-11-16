const accountAgeMin = require('./accountAgeMin');
const prTotalChangesMin = require('./prTotalChangesMin');
const userPublicReposMin = require('./userPublicReposMin');
const blockProtectedPaths = require('./blockProtectedPaths');

const ruleRegistry = {
  [accountAgeMin.id]: accountAgeMin,
  [prTotalChangesMin.id]: prTotalChangesMin,
  [userPublicReposMin.id]: userPublicReposMin,
  [blockProtectedPaths.id]: blockProtectedPaths
};

module.exports = {
  ruleRegistry
};
