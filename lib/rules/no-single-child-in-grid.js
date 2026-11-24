/**
 * @fileoverview Disallow a Grid container with a single child: one item in a
 * container adds grid layout for nothing. Grid *items* (`size`) with one child
 * are normal and allowed.
 * @implements mui-no-single-child-in-grid
 */

'use strict';

const { getAttribute } = require('../utils/mui');
const { singleChildRule } = require('../utils/single-child');

/**
 * Is the attribute present and statically true (`container`, `container={true}`)?
 * `container={false}` or `container={isWide}` is not provably a container.
 * @param {object | undefined} attr JSXAttribute
 * @returns {boolean}
 */
/**
 * The attribute that decides `container`: the last explicit `container` prop,
 * unless a later spread can override it (then unknown → null).
 * @param {object} opening JSXOpeningElement
 * @returns {object | null} JSXAttribute
 */
function effectiveContainer(opening) {
  const attr = getAttribute(opening, 'container');
  if (!attr) return null;
  const lastIndex = opening.attributes.reduce(
    (last, a, i) => (a.type === 'JSXAttribute' && a.name.name === 'container' ? i : last),
    -1,
  );
  const isOverridable = opening.attributes.slice(lastIndex + 1).some((a) => a.type === 'JSXSpreadAttribute');
  return isOverridable ? null : opening.attributes[lastIndex];
}

function isStaticTrue(attr) {
  if (!attr) return false;
  if (attr.value === null) return true;
  const expr = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;
  return Boolean(expr && expr.type === 'Literal' && expr.value === true);
}

module.exports = singleChildRule({
  name: 'no-single-child-in-grid',
  components: new Set(['Grid', 'Grid2', 'GridLegacy']),
  description: 'Disallow a Grid container with a single child',
  message:
    '<{{name}} container> with a single child adds grid layout for nothing; render the child directly or use <Box>.',
  applies: (opening) => isStaticTrue(effectiveContainer(opening)),
});
