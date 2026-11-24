/**
 * @fileoverview Disallow the legacy Grid API on the v7+ `Grid`: `item`,
 * `zeroMinWidth`, breakpoint props (`xs`..`xl` → `size`) and `direction="column"`.
 * @implements mui-no-legacy-grid
 * @see https://mui.com/material-ui/migration/upgrade-to-grid-v2/
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/#grid
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const {
  attributeName,
  attributeRemovalRange,
  attributeStringValue,
  collectMuiImports,
  getAttribute,
  resolveJsxComponent,
} = require('../utils/mui');

const GRIDS = new Set(['Grid', 'Grid2']);
const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl'];
const DROPPED = new Set(['item', 'zeroMinWidth']);
const COLUMN_DIRECTIONS = new Set(['column', 'column-reverse']);

/**
 * Is the breakpoint value `true` (legacy "grow")?
 * @param {object} attr JSXAttribute
 * @returns {boolean}
 */
function isGrow(attr) {
  if (attr.value === null) return true;
  const expr = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;
  return Boolean(expr && expr.type === 'Literal' && expr.value === true);
}

/**
 * Breakpoint value as a JS expression for inside `size={{ ... }}`.
 * @param {object} attr JSXAttribute
 * @param {object} sourceCode
 * @returns {string | null} null when the value cannot be moved
 */
function breakpointExpression(attr, sourceCode) {
  if (isGrow(attr)) return "'grow'";
  if (attr.value.type === 'Literal') return sourceCode.getText(attr.value);
  if (attr.value.expression.type === 'JSXEmptyExpression') return null;
  return sourceCode.getText(attr.value.expression);
}

/**
 * The `size` attribute replacing one or more breakpoint props.
 * @param {object[]} attrs breakpoint attributes
 * @param {object} sourceCode
 * @returns {string | null}
 */
function sizeAttribute(attrs, sourceCode) {
  const values = attrs.map((attr) => breakpointExpression(attr, sourceCode));
  if (values.includes(null)) return null;
  if (attrs.length === 1 && attributeName(attrs[0]) === 'xs') {
    const [attr] = attrs;
    if (isGrow(attr)) return 'size="grow"';
    return attr.value.type === 'Literal' ? `size=${sourceCode.getText(attr.value)}` : `size={${values[0]}}`;
  }
  return `size={{ ${attrs.map((attr, i) => `${attributeName(attr)}: ${values[i]}`).join(', ')} }}`;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the legacy Grid API (`item`, `xs`..`xl`, `zeroMinWidth`, column direction) on Grid',
      recommended: true,
      url: docsUrl('no-legacy-grid'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      dropped:
        "'{{prop}}' is not part of the Grid API since v7; remove it (codemod: `npx @mui/codemod@latest v7.0.0/grid-props <path>`).",
      breakpoint: "Breakpoint prop '{{prop}}' was replaced by `size` (a number, or an object keyed by breakpoint).",
      columnDirection:
        'Grid no longer supports direction="{{value}}" (removed in v9). Use <Stack> for vertical layouts.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    let bindings = new Map();

    /**
     * One fix that removes dropped props and folds breakpoints into `size`.
     * @param {object} node JSXOpeningElement
     * @param {object[]} dropped
     * @param {object[]} breakpoints
     * @returns {((fixer: object) => object[]) | null}
     */
    function combinedFix(node, dropped, breakpoints) {
      const size = breakpoints.length > 0 ? sizeAttribute(breakpoints, sourceCode) : '';
      if (size === null || (breakpoints.length > 0 && getAttribute(node, 'size'))) return null;
      return (fixer) => {
        const fixes = [];
        const [anchor, ...rest] = breakpoints;
        if (anchor) fixes.push(fixer.replaceText(anchor, size));
        [...rest, ...dropped].forEach((attr) => fixes.push(fixer.removeRange(attributeRemovalRange(attr, sourceCode))));
        return fixes;
      };
    }

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXOpeningElement(node) {
        if (!GRIDS.has(resolveJsxComponent(node, bindings))) return;

        const dropped = node.attributes.filter((attr) => DROPPED.has(attributeName(attr)));
        const breakpoints = BREAKPOINTS.map((bp) => getAttribute(node, bp)).filter(Boolean);
        const fix = dropped.length + breakpoints.length > 0 ? combinedFix(node, dropped, breakpoints) : null;

        [...breakpoints, ...dropped]
          .sort((a, b) => a.range[0] - b.range[0])
          .forEach((attr, index) => {
            const prop = attributeName(attr);
            context.report({
              node: attr,
              messageId: DROPPED.has(prop) ? 'dropped' : 'breakpoint',
              data: { prop },
              fix: index === 0 ? fix : null,
            });
          });

        const direction = attributeStringValue(getAttribute(node, 'direction'));
        if (COLUMN_DIRECTIONS.has(direction)) {
          context.report({
            node: getAttribute(node, 'direction'),
            messageId: 'columnDirection',
            data: { value: direction },
          });
        }
      },
    };
  },
};
