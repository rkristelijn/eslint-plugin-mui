/**
 * @fileoverview Shared rule metadata helpers.
 */

'use strict';

const REPO = 'https://github.com/rkristelijn/eslint-plugin-mui';

/**
 * Documentation URL for a rule.
 * @param {string} ruleName
 * @returns {string}
 */
function docsUrl(ruleName) {
  return `${REPO}/blob/main/docs/rules/${ruleName}.md`;
}

module.exports = { docsUrl };
