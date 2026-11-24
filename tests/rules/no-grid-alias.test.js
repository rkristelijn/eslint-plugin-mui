/**
 * @fileoverview Tests for `no-grid-alias`
 * @proves mui-no-grid-alias
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-grid-alias');

createRuleTester().run('no-grid-alias', rule, {
  valid: [
    "import { Avatar, Grid, TextField } from '@mui/material';",
    "import { Grid2 } from '@mui/material';",
    "import Grid from '@mui/material/Grid';",
    // default imports name the binding; that is not an alias of a named export
    "import MyGrid from '@mui/material/Grid';",
    // not MUI
    "import { Grid as G } from 'some-grid-lib';",
    // other components may be aliased
    "import { Button as MuiButton } from '@mui/material';",
  ],
  invalid: [
    {
      name: 'Grid2 as Grid: rename binding and every JSX usage',
      code: `import { Avatar, Grid2 as Grid } from '@mui/material';
const A = () => <Grid container><Grid size={6}><Avatar /></Grid></Grid>;`,
      output: `import { Avatar, Grid2 } from '@mui/material';
const A = () => <Grid2 container><Grid2 size={6}><Avatar /></Grid2></Grid2>;`,
      errors: [{ messageId: 'noAlias', data: { imported: 'Grid2', local: 'Grid' } }],
    },
    {
      name: 'GridLegacy as Grid hides the legacy API',
      code: `import { GridLegacy as Grid } from '@mui/material';
const A = () => <Grid item xs={12} />;`,
      output: `import { GridLegacy } from '@mui/material';
const A = () => <GridLegacy item xs={12} />;`,
      errors: [{ messageId: 'noAlias' }],
    },
    {
      name: 'non-JSX references are renamed too',
      code: `import { Grid as Layout } from '@mui/material';
const styled = withStyle(Layout);`,
      output: `import { Grid } from '@mui/material';
const styled = withStyle(Grid);`,
      errors: [{ messageId: 'noAlias' }],
    },
    {
      name: 'no fix when the real name is already bound in the module',
      code: `import { Grid2 as Grid } from '@mui/material';
const Grid2 = 1;
const A = () => <Grid />;`,
      output: null,
      errors: [{ messageId: 'noAlias' }],
    },
    {
      name: 'no fix when an inner scope would capture the new name',
      code: `import { Grid2 as Grid } from '@mui/material';
function f(Grid2) { return <Grid />; }`,
      output: null,
      errors: [{ messageId: 'noAlias' }],
    },
    {
      name: 'no fix when used as object shorthand (renaming would change the key)',
      code: `import { Grid2 as Grid } from '@mui/material';
export const parts = { Grid };`,
      output: null,
      errors: [{ messageId: 'noAlias' }],
    },
    {
      name: 'shadowed JSX name in an inner scope is left alone',
      code: `import { Grid2 as Grid } from '@mui/material';
const A = () => <Grid />;
function B() { const Grid = 'div'; return <Grid />; }`,
      output: `import { Grid2 } from '@mui/material';
const A = () => <Grid2 />;
function B() { const Grid = 'div'; return <Grid />; }`,
      errors: [{ messageId: 'noAlias' }],
    },
  ],
});
