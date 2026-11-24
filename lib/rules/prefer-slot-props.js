/**
 * @fileoverview Prefer `slots` / `slotProps` over the deprecated `*Props`,
 * `*Component`, `components` and `componentsProps` props that MUI v9 removed.
 * Driven by the data table in lib/data/slot-props.js.
 * @implements mui-prefer-slot-props
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/#deprecated-apis-removed-breaking
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { attributeName, attributeValueText, collectMuiImports, resolveJsxComponent } = require('../utils/mui');
const { mergeIntoObjectAttribute, objectLiteralValue, propertyKeyName } = require('../utils/fix');
const { MANUAL, SLOT_PROPS, codemodFor } = require('../data/slot-props');

/**
 * Split a target like 'slotProps.paper' into group + key path.
 * @param {string} target
 * @returns {{ group: string, path: string[] }}
 */
function parseTarget(target) {
  const [group, ...path] = target.split('.');
  return { group, path };
}

/**
 * Lower-case the first letter (`CloseIcon` → `closeIcon`), as `components` → `slots` requires.
 * @param {string} key
 * @returns {string}
 */
function lowerFirst(key) {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/**
 * Object members to move for one deprecated attribute, or null if not safely movable.
 * @param {object} attr JSXAttribute
 * @param {{ group: string, path: string[] }} target
 * @param {object} sourceCode
 * @returns {{ key: string | null, text?: string, raw?: string }[] | null}
 */
function entriesFor(attr, target, sourceCode) {
  if (target.path.length > 1) return null; // nested slot path (slotProps.actions.nextButton): a human decides
  if (attr.value === null || attr.value.type !== 'JSXExpressionContainer') {
    return target.path.length === 1 ? [{ key: target.path[0], text: attributeValueText(attr, sourceCode) }] : null;
  }
  if (attr.value.expression.type === 'JSXEmptyExpression') return null;
  if (target.path.length === 1) return [{ key: target.path[0], text: attributeValueText(attr, sourceCode) }];

  const object = objectLiteralValue(attr);
  const isComponents = attributeName(attr) === 'components';
  if (!object) return isComponents ? null : [{ key: null, text: attributeValueText(attr, sourceCode) }];

  const entries = [];
  for (const prop of object.properties) {
    const key = propertyKeyName(prop);
    if (prop.type === 'SpreadElement') {
      if (isComponents) return null;
      entries.push({ key: null, raw: sourceCode.getText(prop) });
    } else if (key === null) {
      return null;
    } else if (isComponents) {
      entries.push({ key: lowerFirst(key), raw: `${lowerFirst(key)}: ${sourceCode.getText(prop.value)}` });
    } else {
      entries.push({ key, raw: sourceCode.getText(prop) });
    }
  }
  return entries;
}

/**
 * Do any two entries define the same key?
 * @param {{ key: string | null }[]} entries
 * @returns {boolean}
 */
function hasDuplicateKeys(entries) {
  const keys = entries.map((entry) => entry.key).filter((key) => key !== null);
  return new Set(keys).size !== keys.length;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prefer `slots` / `slotProps` over deprecated component props removed in MUI v9',
      recommended: true,
      url: docsUrl('prefer-slot-props'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      useSlot: "'{{prop}}' was removed from <{{component}}> in MUI v9. Use `{{target}}` (codemod: `{{codemod}}`).",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    let bindings = new Map();

    /**
     * One combined fix that moves every deprecated attribute of the element.
     * @param {object} node JSXOpeningElement
     * @param {{ attr: object, target: object, entries: object[] }[]} moves
     * @returns {((fixer: object) => object[] | null) | null}
     */
    function combinedFix(node, moves) {
      if (moves.some((move) => move.entries === null)) return null;
      const groups = new Map();
      for (const move of moves) {
        if (!groups.has(move.target.group)) groups.set(move.target.group, { entries: [], remove: [] });
        const group = groups.get(move.target.group);
        group.entries.push(...move.entries);
        group.remove.push(move.attr);
      }
      if ([...groups.values()].some((group) => hasDuplicateKeys(group.entries))) return null;

      return (fixer) => {
        const fixes = [];
        for (const [attrName, group] of groups) {
          const part = mergeIntoObjectAttribute({ fixer, sourceCode, element: node, attrName, ...group });
          if (!part) return null;
          fixes.push(...part);
        }
        return fixes;
      };
    }

    return {
      Program(node) {
        bindings = collectMuiImports(node);
      },

      JSXOpeningElement(node) {
        const component = resolveJsxComponent(node, bindings);
        const table = component && SLOT_PROPS[component];
        if (!table) return;

        const moves = node.attributes
          .filter((attr) => Object.prototype.hasOwnProperty.call(table, attributeName(attr) || ''))
          .map((attr) => {
            const prop = attributeName(attr);
            const target = parseTarget(table[prop]);
            const isManual = MANUAL.has(`${component}.${prop}`);
            return { attr, prop, target, entries: isManual ? null : entriesFor(attr, target, sourceCode) };
          });
        if (moves.length === 0) return;

        const fix = combinedFix(node, moves);
        moves.forEach((move, index) => {
          context.report({
            node: move.attr,
            messageId: 'useSlot',
            data: { prop: move.prop, component, target: table[move.prop], codemod: codemodFor(component) },
            fix: index === 0 ? fix : null,
          });
        });
      },
    };
  },
};
