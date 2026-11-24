/**
 * @fileoverview Disallow literal pixel spacing in `sx` (`p: '16px'`); use theme
 * spacing units (`p: 2`) so spacing follows the theme scale.
 * @implements mui-no-literal-spacing
 * @see https://mui.com/system/spacing/
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { propertyKeyName } = require('../utils/fix');
const { SPACING_KEYS } = require('../data/system');

const PX_RE = /^-?\d+(\.\d+)?px$/;
const HAS_PX_RE = /(^|\s)-?\d+(\.\d+)?px(\s|$)/;

/**
 * Pixel spacing literal (`'16px'`, `'8px 16px'`), ignoring zero.
 * @param {object} node
 * @returns {boolean}
 */
function isPixelLiteral(node) {
  if (node.type !== 'Literal' || typeof node.value !== 'string') return false;
  const value = node.value.trim();
  return HAS_PX_RE.test(value) && !/^-?0+(\.0+)?px$/.test(value);
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow literal pixel spacing values in `sx`; use theme spacing units',
      recommended: false,
      url: docsUrl('no-literal-spacing'),
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          spacing: {
            description: 'Pixels per theme spacing unit, used for the suggested replacement (default 8).',
            type: 'number',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ spacing: 8 }],
    messages: {
      literalSpacing: "Literal spacing '{{value}}' in `sx`. Use theme spacing units (default 1 unit = 8px).",
      useUnits: 'Replace with {{units}} (theme spacing units at {{spacing}}px per unit).',
    },
  },

  create(context) {
    const [{ spacing }] = context.options;

    /**
     * @param {object} valueNode literal holding the px value
     */
    function report(valueNode) {
      const value = valueNode.value.trim();
      const units = PX_RE.test(value) ? parseFloat(value) / spacing : null;
      const isWholeUnits = units !== null && Number.isInteger(units * 2);
      context.report({
        node: valueNode,
        messageId: 'literalSpacing',
        data: { value },
        suggest: isWholeUnits
          ? [
              {
                messageId: 'useUnits',
                data: { units: String(units), spacing: String(spacing) },
                fix: (fixer) => fixer.replaceText(valueNode, String(units)),
              },
            ]
          : [],
      });
    }

    /**
     * Check a spacing value: literal, responsive object, or responsive array.
     * @param {object} node
     */
    function checkSpacingValue(node) {
      if (isPixelLiteral(node)) report(node);
      else if (node.type === 'ObjectExpression')
        node.properties.forEach((p) => p.type === 'Property' && checkSpacingValue(p.value));
      else if (node.type === 'ArrayExpression') node.elements.forEach((el) => el && checkSpacingValue(el));
    }

    /**
     * Walk an sx object, descending into selectors / media queries.
     * @param {object} node ObjectExpression | ArrayExpression
     */
    function walk(node) {
      if (node.type === 'ArrayExpression') {
        node.elements.forEach((el) => el && walk(el));
        return;
      }
      if (node.type !== 'ObjectExpression') return;
      for (const prop of node.properties) {
        if (prop.type !== 'Property') continue;
        const key = propertyKeyName(prop);
        if (key !== null && SPACING_KEYS.has(key)) checkSpacingValue(prop.value);
        else if (prop.value.type === 'ObjectExpression') walk(prop.value);
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'sx' || !node.value || node.value.type !== 'JSXExpressionContainer') return;
        walk(node.value.expression);
      },
    };
  },
};
