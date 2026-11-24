/**
 * @fileoverview Tests for `no-legacy-grid`
 * @proves mui-no-legacy-grid
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-legacy-grid');

const IMPORT = "import { Grid } from '@mui/material';\n";

createRuleTester().run('no-legacy-grid', rule, {
  valid: [
    `${IMPORT}<Grid container spacing={2}><Grid size={{ xs: 12, md: 6 }} /></Grid>;`,
    `${IMPORT}<Grid container direction="row-reverse" />;`,
    `${IMPORT}<Grid size="grow" offset={2} />;`,
    // GridLegacy is a different component (no-removed-imports reports it)
    "import { GridLegacy } from '@mui/material';\n<GridLegacy item xs={12} />;",
    // not MUI
    '<Grid item xs={12} />;',
  ],
  invalid: [
    {
      name: 'item + xs only → size={n}',
      code: `${IMPORT}<Grid item xs={12} />;`,
      output: `${IMPORT}<Grid size={12} />;`,
      errors: [
        { messageId: 'dropped', data: { prop: 'item' } },
        { messageId: 'breakpoint', data: { prop: 'xs' } },
      ],
    },
    {
      name: 'several breakpoints → size object',
      code: `${IMPORT}<Grid item xs={12} md={6} lg={4}>x</Grid>;`,
      output: `${IMPORT}<Grid size={{ xs: 12, md: 6, lg: 4 }}>x</Grid>;`,
      errors: 4,
    },
    {
      name: 'boolean breakpoint means grow; string values kept',
      code: `${IMPORT}<Grid xs />;\n<Grid sm="auto" md />;`,
      output: `${IMPORT}<Grid size="grow" />;\n<Grid size={{ sm: "auto", md: 'grow' }} />;`,
      errors: 3,
    },
    {
      name: 'string literal xs',
      code: `${IMPORT}<Grid xs="auto" />;`,
      output: `${IMPORT}<Grid size="auto" />;`,
      errors: [{ messageId: 'breakpoint', data: { prop: 'xs' } }],
    },
    {
      name: 'zeroMinWidth is dropped',
      code: `${IMPORT}<Grid size={6} zeroMinWidth />;`,
      output: `${IMPORT}<Grid size={6} />;`,
      errors: [{ messageId: 'dropped', data: { prop: 'zeroMinWidth' } }],
    },
    {
      name: 'existing size: no fix for breakpoints',
      code: `${IMPORT}<Grid size={6} md={4} />;`,
      output: null,
      errors: [{ messageId: 'breakpoint', data: { prop: 'md' } }],
    },
    {
      name: 'direction column → Stack (report only)',
      code: `${IMPORT}<Grid container direction="column" />;\n<Grid container direction={'column-reverse'} />;`,
      output: null,
      errors: [
        { messageId: 'columnDirection', data: { value: 'column' } },
        { messageId: 'columnDirection', data: { value: 'column-reverse' } },
      ],
    },
    {
      name: 'aliased Grid2 and path import',
      code: "import G from '@mui/material/Grid';\n<G item md={3} />;",
      output: "import G from '@mui/material/Grid';\n<G size={{ md: 3 }} />;",
      errors: 2,
    },
  ],
});
