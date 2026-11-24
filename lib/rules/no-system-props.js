/**
 * @fileoverview Disallow MUI System props (`<Box mt={2}>`) on components that
 * lost them in v9; autofix moves them into `sx`.
 * @implements mui-no-system-props
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/#system-props
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { attributeName, attributeValueText, collectMuiImports, resolveJsxComponent } = require('../utils/mui');
const { mergeIntoObjectAttribute } = require('../utils/fix');
const { SYSTEM_PROPS, SYSTEM_PROP_COMPONENTS } = require('../data/system');

/**
 * Can this attribute value be moved verbatim into an object literal?
 * @param {object} attr JSXAttribute
 * @returns {boolean}
 */
function isMovableValue(attr) {
  if (attr.value === null || attr.value.type === 'Literal') return true;
  return attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type !== 'JSXEmptyExpression';
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow MUI System props on components (removed in v9); use `sx`',
      recommended: true,
      url: docsUrl('no-system-props'),
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            description: 'System prop names to leave alone (e.g. when forwarded to a custom `component`).',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ ignore: [] }],
    messages: {
      systemProp:
        "System prop '{{prop}}' on <{{component}}> was removed in MUI v9. Move it into `sx` (codemod: `npx @mui/codemod@latest v9.0.0/system-props <path>`).",
    },
  },

  create(context) {
    const [{ ignore }] = context.options;
    const ignored = new Set(ignore);
    const sourceCode = context.sourceCode;
    let bindings = new Map();

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXOpeningElement(node) {
        const component = resolveJsxComponent(node, bindings);
        const ownProps = component && SYSTEM_PROP_COMPONENTS[component];
        if (!ownProps) return;

        const systemAttrs = node.attributes.filter((attr) => {
          const name = attributeName(attr);
          return name !== null && SYSTEM_PROPS.has(name) && !ownProps.has(name) && !ignored.has(name);
        });
        if (systemAttrs.length === 0) return;

        const isFixable = systemAttrs.every(isMovableValue);
        systemAttrs.forEach((attr, index) => {
          context.report({
            node: attr,
            messageId: 'systemProp',
            data: { prop: attributeName(attr), component },
            // One combined fix on the first report; the others resolve with it.
            fix:
              index === 0 && isFixable
                ? (fixer) =>
                    mergeIntoObjectAttribute({
                      fixer,
                      sourceCode,
                      element: node,
                      attrName: 'sx',
                      entries: systemAttrs.map((a) => ({
                        key: attributeName(a),
                        text: attributeValueText(a, sourceCode),
                      })),
                      remove: systemAttrs,
                    })
                : null,
          });
        });
      },
    };
  },
};
