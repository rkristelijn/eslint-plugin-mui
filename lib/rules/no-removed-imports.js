/**
 * @fileoverview Disallow imports of MUI exports and modules that were removed
 * (Grid2, GridLegacy, Hidden, experimentalStyled, ...).
 * @implements mui-no-removed-imports
 * @see https://mui.com/material-ui/migration/upgrade-to-v7/
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { importedName } = require('../utils/mui');
const { REMOVED_EXPORTS, REMOVED_MODULES } = require('../data/removed');

/**
 * Removed module entry for a source (`@mui/material/modern/...` included).
 * @param {string} source
 * @returns {{ since: string, hint: string } | null}
 */
function removedModule(source) {
  const key = Object.keys(REMOVED_MODULES).find((mod) => source === mod || source.startsWith(`${mod}/`));
  return key ? REMOVED_MODULES[key] : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing MUI exports and modules that were removed in v7 / v9',
      recommended: true,
      url: docsUrl('no-removed-imports'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      removedExport: "'{{name}}' was removed from '{{source}}' in MUI {{since}}: {{hint}}.",
      removedModule: "'{{source}}' was removed in MUI {{since}}: {{hint}}.",
    },
  },

  create(context) {
    /**
     * Fix for one removed specifier, when a 1:1 replacement exists.
     * @param {object} node ImportDeclaration
     * @param {object} spec specifier
     * @param {{ source: string, name: string }} to replacement
     * @returns {((fixer: object) => object) | null}
     */
    function fixFor(node, spec, to) {
      if (!to) return null;
      if (spec.type === 'ImportDefaultSpecifier' && to.name === 'default' && node.specifiers.length === 1) {
        return (fixer) => fixer.replaceText(node.source, `'${to.source}'`);
      }
      if (spec.type === 'ImportSpecifier' && to.source === node.source.value) {
        // Keep the local binding so no usage changes; no-grid-alias can then rename it.
        const binding = spec.local.name === to.name ? to.name : `${to.name} as ${spec.local.name}`;
        return (fixer) => fixer.replaceText(spec, binding);
      }
      return null;
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        const mod = removedModule(source);
        if (mod) {
          context.report({
            node: node.source,
            messageId: 'removedModule',
            data: { source, since: mod.since, hint: mod.hint },
          });
          return;
        }
        for (const spec of node.specifiers) {
          const name = importedName(spec);
          const entry = REMOVED_EXPORTS[`${source}#${name}`];
          if (!entry) continue;
          context.report({
            node: spec,
            messageId: 'removedExport',
            data: {
              name: name === 'default' ? source.split('/').pop() : name,
              source,
              since: entry.since,
              hint: entry.hint,
            },
            fix: fixFor(node, spec, entry.to),
          });
        }
      },
    };
  },
};
