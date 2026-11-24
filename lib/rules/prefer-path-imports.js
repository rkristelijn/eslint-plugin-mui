/**
 * @fileoverview Prefer path imports over MUI barrel imports (faster dev builds).
 * @implements mui-prefer-path-imports
 * @see https://mui.com/material-ui/guides/minimizing-bundle-size/
 */

'use strict';

const { docsUrl } = require('../utils/meta');

const ICONS = '@mui/icons-material';
const DEFAULT_PACKAGES = [ICONS, '@mui/material'];

/**
 * Can we rewrite this icons barrel import into per-icon default imports?
 * @param {object} node ImportDeclaration
 * @returns {boolean}
 */
function isFixableIconImport(node) {
  return (
    node.source.value === ICONS &&
    node.specifiers.length > 0 &&
    node.specifiers.every((spec) => spec.type === 'ImportSpecifier' && spec.importKind !== 'type')
  );
}

/**
 * Leading whitespace of the line a node starts on.
 * @param {object} node
 * @param {object} sourceCode
 * @returns {string}
 */
function indentationOf(node, sourceCode) {
  const line = sourceCode.lines[node.loc.start.line - 1];
  return line.slice(0, node.loc.start.column).match(/^\s*/)[0];
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer path imports (`@mui/material/Button`) over barrel imports (`@mui/material`)',
      recommended: true,
      url: docsUrl('prefer-path-imports'),
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          packages: {
            description: 'Barrel packages to report (default: @mui/icons-material and @mui/material).',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ packages: DEFAULT_PACKAGES }],
    messages: {
      barrel:
        "Barrel import from '{{source}}' slows down dev startup and rebuilds. Import each module by path, e.g. `import Button from '{{source}}/Button'` (codemod: `npx @mui/codemod@latest v5.0.0/path-imports <path>`).",
      barrelIcons:
        "Named imports from '@mui/icons-material' are up to 6x slower in dev. Use default path imports, e.g. `import {{example}} from '@mui/icons-material/{{example}}'`.",
    },
  },

  create(context) {
    const [{ packages }] = context.options;
    const watched = new Set(packages);
    const sourceCode = context.sourceCode;

    return {
      ImportDeclaration(node) {
        if (!watched.has(node.source.value) || node.importKind === 'type') return;
        const runtimeSpecs = node.specifiers.filter((spec) => spec.importKind !== 'type');
        if (runtimeSpecs.length === 0 || runtimeSpecs.every((spec) => spec.type === 'ImportDefaultSpecifier')) return;

        if (node.source.value !== ICONS) {
          context.report({ node, messageId: 'barrel', data: { source: node.source.value } });
          return;
        }

        const first = runtimeSpecs[0];
        const example = first.type === 'ImportSpecifier' ? first.imported.name : 'Delete';
        context.report({
          node,
          messageId: 'barrelIcons',
          data: { example },
          fix: isFixableIconImport(node)
            ? (fixer) => {
                const indent = indentationOf(node, sourceCode);
                const lines = node.specifiers.map(
                  (spec) => `import ${spec.local.name} from '${ICONS}/${spec.imported.name}';`,
                );
                return fixer.replaceText(node, lines.join(`\n${indent}`));
              }
            : null,
        });
      },
    };
  },
};
