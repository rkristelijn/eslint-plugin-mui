/**
 * @fileoverview Require an accessible name on MUI `IconButton` (WCAG 2.2 SC 4.1.2).
 * An icon has no text, so screen readers announce just "button" without one.
 * @implements mui-icon-button-aria-label
 * @see https://mui.com/material-ui/react-button/#icon-button
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { collectMuiImports, getAttribute, hasSpread, resolveJsxComponent } = require('../utils/mui');

const NAME_ATTRIBUTES = ['aria-label', 'aria-labelledby'];

/**
 * Does the element have visible text content that names it?
 * @param {object} element JSXElement
 * @returns {boolean}
 */
function hasTextChild(element) {
  return element.children.some((child) => {
    if (child.type === 'JSXText') return child.value.trim() !== '';
    if (child.type !== 'JSXExpressionContainer') return false;
    const expr = child.expression;
    if (expr.type === 'Literal') return typeof expr.value === 'string' && expr.value.trim() !== '';
    return (
      expr.type === 'TemplateLiteral' && expr.expressions.length === 0 && expr.quasis[0].value.cooked.trim() !== ''
    );
  });
}

/**
 * Is a boolean prop on (`describeChild`, `describeChild={true}`)?
 * A non-literal value counts as on: it may describe instead of label.
 * @param {object | undefined} attr JSXAttribute
 * @returns {boolean}
 */
function isFlagOn(attr) {
  if (!attr) return false;
  if (attr.value === null) return true;
  const expr = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;
  return !(expr && expr.type === 'Literal' && expr.value === false);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require `aria-label` (or a Tooltip) on MUI IconButton',
      recommended: true,
      url: docsUrl('icon-button-aria-label'),
    },
    schema: [],
    messages: {
      missingLabel:
        '<{{name}}> has no accessible name. Add `aria-label="…"` (or wrap it in a <Tooltip title="…">) so screen readers can announce it.',
    },
  },

  create(context) {
    let bindings = new Map();

    /**
     * Is the element the direct child of an MUI Tooltip that labels it?
     * Tooltip sets `aria-label` on its child from `title`, unless
     * `describeChild` is on: then the title is only a description.
     * @param {object} element JSXElement
     * @returns {boolean}
     */
    function isInsideTooltip(element) {
      const parent = element.parent;
      if (!parent || parent.type !== 'JSXElement') return false;
      const opening = parent.openingElement;
      return (
        resolveJsxComponent(opening, bindings, context.sourceCode) === 'Tooltip' &&
        Boolean(getAttribute(opening, 'title')) &&
        !isFlagOn(getAttribute(opening, 'describeChild'))
      );
    }

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXElement(node) {
        const opening = node.openingElement;
        if (resolveJsxComponent(opening, bindings, context.sourceCode) !== 'IconButton' || hasSpread(opening)) return;
        if (NAME_ATTRIBUTES.some((name) => getAttribute(opening, name))) return;
        if (hasTextChild(node) || isInsideTooltip(node)) return;
        context.report({ node: opening, messageId: 'missingLabel', data: { name: opening.name.name } });
      },
    };
  },
};
