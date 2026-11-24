/**
 * @fileoverview Disallow a Grid container with a single child: one item in a
 * container adds grid layout for nothing. Grid *items* (`size`) with one child
 * are normal and allowed.
 * @implements mui-no-single-child-in-grid
 */

'use strict';

const { getAttribute } = require('../utils/mui');
const { singleChildRule } = require('../utils/single-child');

module.exports = singleChildRule({
  name: 'no-single-child-in-grid',
  components: new Set(['Grid', 'Grid2', 'GridLegacy']),
  description: 'Disallow a Grid container with a single child',
  message:
    '<{{name}} container> with a single child adds grid layout for nothing; render the child directly or use <Box>.',
  applies: (opening) => Boolean(getAttribute(opening, 'container')),
});
