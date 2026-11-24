/**
 * @fileoverview Require an explicit `nativeButton` when a button-like MUI
 * component renders a custom React component via `component` (v9, SSR-correct
 * button semantics before hydration).
 * @implements mui-require-native-button
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/#buttonbase
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { collectMuiImports, getAttribute, hasSpread, resolveJsxComponent } = require('../utils/mui');
const { BUTTON_LIKE } = require('../data/system');

/**
 * Does `component={...}` pass a React component (not an HTML tag string)?
 * @param {object | undefined} attr JSXAttribute
 * @returns {boolean}
 */
function isCustomComponent(attr) {
  if (!attr || !attr.value || attr.value.type !== 'JSXExpressionContainer') return false;
  const expr = attr.value.expression;
  if (expr.type === 'JSXEmptyExpression') return false;
  const isStringLiteral =
    (expr.type === 'Literal' && typeof expr.value === 'string') || expr.type === 'TemplateLiteral';
  return !isStringLiteral;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require `nativeButton` when a button-like MUI component gets a custom `component`',
      recommended: true,
      url: docsUrl('require-native-button'),
    },
    schema: [],
    messages: {
      missingNativeButton:
        '<{{component}} component={…}> renders a custom component: set `nativeButton` explicitly (`true` if it renders a <button>, `false` otherwise) so SSR output has the right semantics.',
    },
  },

  create(context) {
    let bindings = new Map();

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXOpeningElement(node) {
        const component = resolveJsxComponent(node, bindings, context.sourceCode);
        if (!BUTTON_LIKE.has(component) || hasSpread(node) || getAttribute(node, 'nativeButton')) return;
        const attr = getAttribute(node, 'component');
        if (!isCustomComponent(attr)) return;
        context.report({ node: attr, messageId: 'missingNativeButton', data: { component } });
      },
    };
  },
};
