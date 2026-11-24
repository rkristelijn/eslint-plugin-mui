/**
 * @fileoverview Disallow imports of MUI exports from a package they moved out of
 * (`@mui/lab` → `@mui/material`, `StyledEngineProvider` → `@mui/material/styles`).
 * @implements mui-no-moved-imports
 * @see https://mui.com/material-ui/migration/upgrade-to-v7/
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { importedName } = require('../utils/mui');
const { LAB_MOVED, MOVED_TO_STYLES } = require('../data/removed');

/**
 * Where does a named export of a barrel live now?
 * @param {string} source barrel source
 * @param {string} name exported name
 * @returns {string | null} new source, or null if it did not move
 */
function barrelTarget(source, name) {
  if (source === '@mui/lab' && LAB_MOVED.has(name)) return '@mui/material';
  if (source === '@mui/material' && MOVED_TO_STYLES.has(name)) return '@mui/material/styles';
  return null;
}

/**
 * Where does a default path import live now?
 * @param {string} source e.g. '@mui/lab/Alert'
 * @returns {string | null}
 */
function pathTarget(source) {
  const match = /^@mui\/lab\/([^/]+)$/.exec(source);
  return match && LAB_MOVED.has(match[1]) ? `@mui/material/${match[1]}` : null;
}

/**
 * Leading whitespace of the line a node starts on.
 * @param {object} node
 * @param {object} sourceCode
 * @returns {string}
 */
function indentationOf(node, sourceCode) {
  return sourceCode.lines[node.loc.start.line - 1].slice(0, node.loc.start.column).match(/^\s*/)[0];
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing MUI exports from the package they moved out of',
      recommended: true,
      url: docsUrl('no-moved-imports'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      moved: "'{{names}}' moved from '{{from}}' to '{{to}}'.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    /**
     * Rewrite a barrel import: keep what stays, one new import per target.
     * @param {object} node ImportDeclaration
     * @param {Map<string, object[]>} byTarget target source → specifiers
     * @param {object[]} stays specifiers that did not move
     * @returns {string}
     */
    function splitImport(node, byTarget, stays) {
      const kind = node.importKind === 'type' ? 'type ' : '';
      const render = (specs, source) =>
        `import ${kind}{ ${specs.map((spec) => sourceCode.getText(spec)).join(', ')} } from '${source}';`;
      const parts = stays.length > 0 ? [render(stays, node.source.value)] : [];
      byTarget.forEach((specs, target) => parts.push(render(specs, target)));
      return parts.join(`\n${indentationOf(node, sourceCode)}`);
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        const newPath = pathTarget(source);
        if (newPath) {
          context.report({
            node: node.source,
            messageId: 'moved',
            data: { names: source.split('/').pop(), from: '@mui/lab', to: '@mui/material' },
            fix: (fixer) => fixer.replaceText(node.source, `'${newPath}'`),
          });
          return;
        }

        const byTarget = new Map();
        const stays = [];
        for (const spec of node.specifiers) {
          const target = spec.type === 'ImportSpecifier' ? barrelTarget(source, importedName(spec)) : null;
          if (!target) {
            stays.push(spec);
            continue;
          }
          if (!byTarget.has(target)) byTarget.set(target, []);
          byTarget.get(target).push(spec);
        }
        if (byTarget.size === 0) return;

        const isSplittable = stays.every((spec) => spec.type === 'ImportSpecifier');
        byTarget.forEach((specs, target) => {
          context.report({
            node,
            messageId: 'moved',
            data: { names: specs.map(importedName).join("', '"), from: source, to: target },
            fix: isSplittable ? (fixer) => fixer.replaceText(node, splitImport(node, byTarget, stays)) : null,
          });
        });
      },
    };
  },
};
