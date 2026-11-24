/**
 * @fileoverview ESLint plugin for MUI: flat-config plugin object with rules
 * and the `recommended` / `strict` configs.
 * @implements ADR-002 ADR-003
 */

'use strict';

const { name, version } = require('../package.json');

/** Rule registry. Explicit (no directory scan) so the published API is reviewable. */
const rules = {
  'icon-button-aria-label': require('./rules/icon-button-aria-label'),
  'no-deep-imports': require('./rules/no-deep-imports'),
  'no-grid-alias': require('./rules/no-grid-alias'),
  'no-legacy-grid': require('./rules/no-legacy-grid'),
  'no-literal-colors': require('./rules/no-literal-colors'),
  'no-literal-spacing': require('./rules/no-literal-spacing'),
  'no-moved-imports': require('./rules/no-moved-imports'),
  'no-removed-icons': require('./rules/no-removed-icons'),
  'no-removed-imports': require('./rules/no-removed-imports'),
  'no-removed-props': require('./rules/no-removed-props'),
  'no-single-child-in-grid': require('./rules/no-single-child-in-grid'),
  'no-single-child-in-stack': require('./rules/no-single-child-in-stack'),
  'no-system-props': require('./rules/no-system-props'),
  'prefer-named-imports': require('./rules/prefer-named-imports'),
  'prefer-path-imports': require('./rules/prefer-path-imports'),
  'prefer-slot-props': require('./rules/prefer-slot-props'),
  'require-native-button': require('./rules/require-native-button'),
  'sort-sx-keys': require('./rules/sort-sx-keys'),
};

/**
 * recommended: removed/moved APIs are errors (they break on MUI v9), hygiene
 * and a11y are warnings. Opinionated style rules are left to `strict`.
 */
const RECOMMENDED = {
  'mui/no-deep-imports': 'error',
  'mui/no-legacy-grid': 'error',
  'mui/no-moved-imports': 'error',
  'mui/no-removed-icons': 'error',
  'mui/no-removed-imports': 'error',
  'mui/no-removed-props': 'error',
  'mui/no-system-props': 'error',
  'mui/prefer-slot-props': 'error',
  'mui/icon-button-aria-label': 'warn',
  'mui/no-grid-alias': 'warn',
  'mui/no-single-child-in-grid': 'warn',
  'mui/no-single-child-in-stack': 'warn',
  'mui/prefer-path-imports': 'warn',
  'mui/require-native-button': 'warn',
};

/** strict: every non-deprecated rule as an error. */
const STRICT = Object.fromEntries(
  Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .map(([ruleName]) => [`mui/${ruleName}`, 'error']),
);

const plugin = {
  meta: { name, version, namespace: 'mui' },
  rules,
  configs: {},
};

const languageOptions = { parserOptions: { ecmaFeatures: { jsx: true } } };

plugin.configs.recommended = { name: 'mui/recommended', plugins: { mui: plugin }, languageOptions, rules: RECOMMENDED };
plugin.configs.strict = { name: 'mui/strict', plugins: { mui: plugin }, languageOptions, rules: STRICT };

module.exports = plugin;
