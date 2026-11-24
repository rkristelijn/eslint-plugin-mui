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
  return element.children.some((child) => child.type === 'JSXText' && child.value.trim() !== '');
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
     * Is the element the direct child of an MUI Tooltip with a title?
     * Tooltip sets `aria-label` on its child from `title`.
     * @param {object} element JSXElement
     * @returns {boolean}
     */
    function isInsideTooltip(element) {
      const parent = element.parent;
      if (!parent || parent.type !== 'JSXElement') return false;
      const opening = parent.openingElement;
      return resolveJsxComponent(opening, bindings) === 'Tooltip' && Boolean(getAttribute(opening, 'title'));
    }

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXElement(node) {
        const opening = node.openingElement;
        if (resolveJsxComponent(opening, bindings) !== 'IconButton' || hasSpread(opening)) return;
        if (NAME_ATTRIBUTES.some((name) => getAttribute(opening, name))) return;
        if (hasTextChild(node) || isInsideTooltip(node)) return;
        context.report({ node: opening, messageId: 'missingLabel', data: { name: opening.name.name } });
      },
    };
  },
};
