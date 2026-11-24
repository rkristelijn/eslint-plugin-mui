/**
 * @fileoverview Fix builders shared by rules that move JSX props into an
 * object prop (`sx`, `slots`, `slotProps`).
 * @implements ADR-003.object-prop-merge
 */

'use strict';

const { attributeRemovalRange, getAttribute } = require('./mui');

/**
 * Static key name of an object property (`a`, `'a'`), or null when computed/spread.
 * @param {object} prop Property | SpreadElement
 * @returns {string | null}
 */
function propertyKeyName(prop) {
  if (prop.type !== 'Property' || prop.computed) return null;
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'Literal') return String(prop.key.value);
  return null;
}

/**
 * The object literal inside `attr={{ ... }}`, or null.
 * @param {object} attr JSXAttribute
 * @returns {object | null} ObjectExpression
 */
function objectLiteralValue(attr) {
  const container = attr && attr.value;
  if (!container || container.type !== 'JSXExpressionContainer') return null;
  return container.expression.type === 'ObjectExpression' ? container.expression : null;
}

/**
 * Render entries as object-literal members.
 * @param {{ key: string | null, text?: string, raw?: string }[]} entries
 *   `raw` = verbatim member source; else key null = spread of `text`
 * @returns {string}
 */
function renderEntries(entries) {
  return entries
    .map((entry) => {
      if (entry.raw !== undefined) return entry.raw;
      return entry.key === null ? `...${entry.text}` : `${entry.key}: ${entry.text}`;
    })
    .join(', ');
}

/**
 * Build fixes that move `entries` into `attrName={{ ... }}` and delete the
 * source attributes. Returns null when the move is not provably safe
 * (target prop is not an object literal, or a key would be duplicated).
 *
 * @param {object} args
 * @param {object} args.fixer ESLint fixer
 * @param {object} args.sourceCode ESLint SourceCode
 * @param {object} args.element JSXOpeningElement
 * @param {string} args.attrName target attribute, e.g. 'sx'
 * @param {{ key: string | null, text: string }[]} args.entries members to add
 * @param {object[]} args.remove attributes being replaced (first is the anchor)
 * @returns {object[] | null}
 */
function mergeIntoObjectAttribute({ fixer, sourceCode, element, attrName, entries, remove }) {
  if (entries.length === 0 || remove.length === 0) return null;
  const target = getAttribute(element, attrName);
  const fixes = [];

  if (!target) {
    const [anchor, ...rest] = remove;
    fixes.push(fixer.replaceText(anchor, `${attrName}={{ ${renderEntries(entries)} }}`));
    rest.forEach((attr) => fixes.push(fixer.removeRange(attributeRemovalRange(attr, sourceCode))));
    return fixes;
  }

  const object = objectLiteralValue(target);
  if (!object) return null;
  const existing = new Set(object.properties.map(propertyKeyName).filter(Boolean));
  if (entries.some((entry) => entry.key !== null && existing.has(entry.key))) return null;

  if (object.properties.length === 0) {
    fixes.push(fixer.replaceText(object, `{ ${renderEntries(entries)} }`));
  } else {
    const last = object.properties[object.properties.length - 1];
    fixes.push(fixer.insertTextAfter(last, `, ${renderEntries(entries)}`));
  }
  remove.forEach((attr) => fixes.push(fixer.removeRange(attributeRemovalRange(attr, sourceCode))));
  return fixes;
}

module.exports = { mergeIntoObjectAttribute, objectLiteralValue, propertyKeyName, renderEntries };
