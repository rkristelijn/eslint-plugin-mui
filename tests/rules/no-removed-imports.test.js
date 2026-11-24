/**
 * @fileoverview Tests for `no-removed-imports`
 * @proves mui-no-removed-imports
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-removed-imports');
const { REMOVED_EXPORTS, REMOVED_MODULES } = require('../../lib/data/removed');

/** Expected error for a removed export, with data taken from the table. */
const removed = (source, name, shown = name) => ({
  messageId: 'removedExport',
  data: {
    name: shown,
    source,
    since: REMOVED_EXPORTS[`${source}#${name}`].since,
    hint: REMOVED_EXPORTS[`${source}#${name}`].hint,
  },
});
const removedModule = (source, mod = source) => ({
  messageId: 'removedModule',
  data: { source, since: REMOVED_MODULES[mod].since, hint: REMOVED_MODULES[mod].hint },
});

createRuleTester().run('no-removed-imports', rule, {
  valid: [
    "import { Grid } from '@mui/material';",
    "import Grid from '@mui/material/Grid';",
    "import { styled } from '@mui/material/styles';",
    "import { Hidden } from 'my-lib';",
    "import { PigmentGrid } from '@mui/material';",
  ],
  invalid: [
    {
      name: 'Grid2 named → Grid, binding kept (no-grid-alias renames it afterwards)',
      code: "import { Grid2, Box } from '@mui/material';",
      output: "import { Grid as Grid2, Box } from '@mui/material';",
      errors: [removed('@mui/material', 'Grid2')],
    },
    {
      code: "import { Unstable_Grid2 as Grid } from '@mui/material';",
      output: "import { Grid } from '@mui/material';",
      errors: [removed('@mui/material', 'Unstable_Grid2')],
    },
    {
      name: 'Grid2 path import → Grid path',
      code: "import Grid2 from '@mui/material/Grid2';",
      output: "import Grid2 from '@mui/material/Grid';",
      errors: [removed('@mui/material/Grid2', 'default', 'Grid2')],
    },
    {
      code: "import Grid from '@mui/material/Unstable_Grid2';",
      output: "import Grid from '@mui/material/Grid';",
      errors: [{ messageId: 'removedExport' }],
    },
    {
      name: 'GridLegacy (v9) needs a real migration: no autofix',
      code: "import { GridLegacy as Grid } from '@mui/material';\nimport G from '@mui/material/GridLegacy';",
      output: null,
      errors: [removed('@mui/material', 'GridLegacy'), removed('@mui/material/GridLegacy', 'default', 'GridLegacy')],
    },
    {
      code: "import { Hidden, PigmentHidden } from '@mui/material';",
      output: null,
      errors: [{ messageId: 'removedExport' }, { messageId: 'removedExport' }],
    },
    {
      code: "import Hidden from '@mui/material/Hidden';",
      output: null,
      errors: [removed('@mui/material/Hidden', 'default', 'Hidden')],
    },
    {
      code: "import { experimentalStyled as styled } from '@mui/material/styles';",
      output: "import { styled } from '@mui/material/styles';",
      errors: [removed('@mui/material/styles', 'experimentalStyled')],
    },
    {
      code: "import { StepButtonIcon } from '@mui/material/StepButton';",
      output: null,
      errors: [{ messageId: 'removedExport' }],
    },
    {
      name: 'removed bundles',
      code: "import { Button } from '@mui/material/modern';\nimport x from '@mui/material/node/Button';",
      output: null,
      errors: [removedModule('@mui/material/modern'), removedModule('@mui/material/node/Button', '@mui/material/node')],
    },
  ],
});
