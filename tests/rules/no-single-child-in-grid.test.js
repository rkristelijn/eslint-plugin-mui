/**
 * @fileoverview Tests for `no-single-child-in-grid`
 * @proves mui-no-single-child-in-grid
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-single-child-in-grid');

const BARREL = "import { Grid, Box, Typography } from '@mui/material';\n";

createRuleTester().run('no-single-child-in-grid', rule, {
  valid: [
    // a later spread can override container: not provably a container
    `${BARREL}const A = () => <Grid container={true} {...{ container: false }}><Box /></Grid>;`,
    `${BARREL}const A = (p) => <Grid container {...p}><Box /></Grid>;`,
    // container={false} / dynamic is not provably a container
    `${BARREL}const A = () => <Grid container={false} size={6}><Box /></Grid>;`,
    `${BARREL}const A = () => <Grid container={isWide}><Box /></Grid>;`,
    // a Grid *item* with one child is the normal case
    `${BARREL}const A = () => <Grid size={6}><Typography>foo</Typography></Grid>;`,
    `${BARREL}const A = () => <Grid container><Grid size={6} /><Grid size={6} /></Grid>;`,
    // expressions may render many children
    `${BARREL}const A = () => <Grid container>{items.map((i) => <Grid key={i} />)}</Grid>;`,
    `${BARREL}const A = ({ children }) => <Grid container>{children}</Grid>;`,
    `${BARREL}const A = () => <Grid container>{Array.from(['a', 'b']).map((x) => <Box key={x} />)}</Grid>;`,
    // fragment with several children
    `${BARREL}const A = () => <Grid container><><Box /><Box /></></Grid>;`,
    // a local component named Grid is not MUI
    'const Grid = (p) => p.children; const A = () => <Grid container><b /></Grid>;',
    // empty container and comments only
    `${BARREL}const A = () => <Grid container>{/* todo */}</Grid>;`,
  ],
  invalid: [
    {
      name: 'a spread before container does not override it',
      code: `${BARREL}const A = (p) => <Grid {...p} container><Box /></Grid>;`,
      errors: [{ messageId: 'singleChild' }],
    },
    {
      name: 'container={true} is a container',
      code: `${BARREL}const A = () => <Grid container={true}><Box /></Grid>;`,
      errors: [{ messageId: 'singleChild' }],
    },
    {
      code: `${BARREL}const A = () => (
  <Grid container spacing={2}>
    <Grid size={12}><Typography>foo</Typography></Grid>
  </Grid>
);`,
      errors: [{ messageId: 'singleChild', data: { name: 'Grid' }, line: 3 }],
    },
    {
      name: 'path import',
      code: "import Grid from '@mui/material/Grid';\nconst A = () => <Grid container><span /></Grid>;",
      errors: [{ messageId: 'singleChild' }],
    },
    {
      name: 'aliased import still resolves',
      code: "import { Grid2 as G } from '@mui/material';\nconst A = () => <G container><span /></G>;",
      errors: [{ messageId: 'singleChild', data: { name: 'G' } }],
    },
    {
      name: 'fragment wrapping a single element',
      code: `${BARREL}const A = () => <Grid container><><Box /></></Grid>;`,
      errors: [{ messageId: 'singleChild' }],
    },
  ],
});
