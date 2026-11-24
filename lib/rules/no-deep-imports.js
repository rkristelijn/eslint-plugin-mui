/**
 * @fileoverview Disallow MUI imports more than one level deep. Since v7 the
 * packages use the `exports` field; deeper paths are private and fail to resolve.
 * @implements mui-no-deep-imports
 * @see https://mui.com/material-ui/migration/upgrade-to-v7/#package-layout-updated
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { parseSource } = require('../utils/mui');
const { DEEP_PATH_MOVES, STYLES_DEFAULT_EXPORTS } = require('../data/removed');

/**
 * Replacement source for a deep path that maps 1:1 onto a flat one.
 * @param {string} source
 * @returns {string | null}
 */
function flatPathFor(source) {
  if (DEEP_PATH_MOVES[source]) return DEEP_PATH_MOVES[source];
  const esm = /^@mui\/icons-material\/esm\/([^/]+)$/.exec(source);
  return esm ? `@mui/icons-material/${esm[1]}` : null;
}

/**
 * `import x from '@mui/<pkg>/styles/<module>'` → `import { name as x } from '@mui/<pkg>/styles'`.
 * @param {object} node ImportDeclaration
 * @returns {string | null} replacement import text
 */
function stylesNamedImportFor(node) {
  const match = /^(@mui\/(?:material|system))\/styles\/([^/]+)$/.exec(node.source.value);
  if (!match || node.importKind === 'type' || node.specifiers.length !== 1) return null;
  const [spec] = node.specifiers;
  const exported = STYLES_DEFAULT_EXPORTS[match[2]];
  if (spec.type !== 'ImportDefaultSpecifier' || !exported) return null;
  const binding = spec.local.name === exported ? exported : `${exported} as ${spec.local.name}`;
  return `import { ${binding} } from '${match[1]}/styles';`;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow MUI imports more than one level deep (private paths, broken since v7)',
      recommended: true,
      url: docsUrl('no-deep-imports'),
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            description:
              'Import path prefixes that may be deep (escape hatch for packages with a documented deep entry).',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allow: [] }],
    messages: {
      deepImport:
        "'{{source}}' is a private deep import; MUI v7+ only exposes one level (e.g. `@mui/material/styles`). Import from the public entry point.",
    },
  },

  create(context) {
    const [{ allow }] = context.options;

    /**
     * @param {object} sourceNode Literal holding the module path
     * @param {object | null} importNode ImportDeclaration when the specifiers can be rewritten
     */
    function check(sourceNode, importNode) {
      if (!sourceNode || sourceNode.type !== 'Literal' || typeof sourceNode.value !== 'string') return;
      const source = sourceNode.value;
      const parsed = parseSource(source);
      if (!parsed || parsed.path.length < 2) return;
      if (allow.some((prefix) => source.startsWith(prefix))) return;

      const flat = flatPathFor(source);
      const named = importNode ? stylesNamedImportFor(importNode) : null;
      context.report({
        node: sourceNode,
        messageId: 'deepImport',
        data: { source },
        fix: (fixer) => {
          if (flat) return fixer.replaceText(sourceNode, `'${flat}'`);
          if (named) return fixer.replaceText(importNode, named);
          return null;
        },
      });
    }

    return {
      ImportDeclaration: (node) => check(node.source, node),
      ExportNamedDeclaration: (node) => check(node.source, null),
      ExportAllDeclaration: (node) => check(node.source, null),
      ImportExpression: (node) => check(node.source, null),
    };
  },
};
