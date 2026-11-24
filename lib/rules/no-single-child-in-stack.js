/**
 * @fileoverview Disallow a Stack with a single child: `spacing` and
 * `direction` only matter between two or more children.
 * @implements mui-no-single-child-in-stack
 */

'use strict';

const { singleChildRule } = require('../utils/single-child');

module.exports = singleChildRule({
  name: 'no-single-child-in-stack',
  components: new Set(['Stack']),
  description: 'Disallow a Stack with a single child',
  message: '<{{name}}> with a single child has nothing to stack; render the child directly or use <Box>.',
});
