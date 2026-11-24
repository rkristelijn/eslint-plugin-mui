/**
 * @fileoverview Factory for "layout component with a single child" rules.
 * @implements ADR-003.single-child
 */

'use strict';

const { docsUrl } = require('./meta');
const { collectMuiImports, resolveJsxComponent } = require('./mui');

/**
 * Children that render something (whitespace-only text is ignored).
 * @param {object} element JSXElement
 * @returns {object[]}
 */
function meaningfulChildren(element) {
  return element.children.filter((child) => {
    if (child.type === 'JSXText') return child.value.trim() !== '';
    if (child.type === 'JSXExpressionContainer') return child.expression.type !== 'JSXEmptyExpression';
    return true;
  });
}

/**
 * Exactly one child that is provably one element? Expressions
 * (`{items.map(...)}`, `{children}`) may render many, so they never count.
 * @param {object} element JSXElement
 * @returns {boolean}
 */
function hasSingleStaticChild(element) {
  const children = meaningfulChildren(element);
  if (children.length !== 1) return false;
  const [child] = children;
  if (child.type === 'JSXFragment') return hasSingleStaticChild(child);
  return child.type === 'JSXElement' || child.type === 'JSXText';
}

/**
 * Build a rule that reports `component` elements with a single static child.
 * @param {object} options
 * @param {string} options.name rule name
 * @param {Set<string>} options.components canonical component names to check
 * @param {string} options.description
 * @param {string} options.message
 * @param {(opening: object) => boolean} [options.applies] extra precondition
 * @returns {object} ESLint rule
 */
function singleChildRule({ name, components, description, message, applies = () => true }) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description, recommended: true, url: docsUrl(name) },
      schema: [],
      messages: { singleChild: message },
    },

    create(context) {
      let bindings = new Map();
      return {
        Program(node) {
          bindings = collectMuiImports(node);
        },
        JSXElement(node) {
          const component = resolveJsxComponent(node.openingElement, bindings);
          if (!components.has(component) || !applies(node.openingElement)) return;
          if (!hasSingleStaticChild(node)) return;
          context.report({
            node: node.openingElement,
            messageId: 'singleChild',
            data: { name: node.openingElement.name.name },
          });
        },
      };
    },
  };
}

module.exports = { hasSingleStaticChild, singleChildRule };
