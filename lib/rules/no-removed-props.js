/**
 * @fileoverview Disallow component props that MUI v7 / v9 removed without a
 * slot replacement (`disableEscapeKeyDown`, `Divider light`, `Typography paragraph`, ...).
 * Driven by the data table in lib/data/removed.js.
 * @implements mui-no-removed-props
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { attributeName, attributeStringValue, collectMuiImports, resolveJsxComponent } = require('../utils/mui');
const { mergeIntoObjectAttribute } = require('../utils/fix');
const { REMOVED_PROPS } = require('../data/removed');

/**
 * Is the attribute a bare boolean (`light`) or `{true}`?
 * @param {object} attr JSXAttribute
 * @returns {boolean}
 */
function isTrueFlag(attr) {
  if (attr.value === null) return true;
  const expr = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;
  return Boolean(expr && expr.type === 'Literal' && expr.value === true);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow component props removed in MUI v7 / v9',
      recommended: true,
      url: docsUrl('no-removed-props'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      removedProp: "'{{prop}}' was removed from <{{component}}> in MUI {{since}}: {{hint}}.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    let bindings = new Map();

    /**
     * Build the fix for one removed prop, or null when a human must decide.
     * @param {object} element JSXOpeningElement
     * @param {object} attr JSXAttribute
     * @param {object | undefined} fix fix descriptor from the data table
     * @returns {((fixer: object) => object | object[] | null) | null}
     */
    function fixFor(element, attr, fix) {
      if (!fix) return null;
      if (fix.kind === 'rename') return (fixer) => fixer.replaceText(attr.name, fix.to);
      if (fix.kind === 'value') return (fixer) => fixer.replaceText(attr.value, `"${fix.to}"`);
      if (fix.kind === 'sx' && isTrueFlag(attr)) {
        return (fixer) =>
          mergeIntoObjectAttribute({
            fixer,
            sourceCode,
            element,
            attrName: 'sx',
            entries: fix.entries.map(([key, text]) => ({ key, text })),
            remove: [attr],
          });
      }
      return null;
    }

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXOpeningElement(node) {
        const component = resolveJsxComponent(node, bindings);
        const table = component && REMOVED_PROPS[component];
        if (!table) return;

        for (const attr of node.attributes) {
          const prop = attributeName(attr);
          const entry = prop && Object.prototype.hasOwnProperty.call(table, prop) ? table[prop] : null;
          if (!entry) continue;
          // Value-specific removals (size="normal") only fire on that value.
          if (entry.fix && entry.fix.kind === 'value' && attributeStringValue(attr) !== entry.fix.from) continue;
          context.report({
            node: attr,
            messageId: 'removedProp',
            data: { prop, component, since: entry.since, hint: entry.hint },
            fix: fixFor(node, attr, entry.fix),
          });
        }
      },
    };
  },
};
