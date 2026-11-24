/**
 * @fileoverview Tests for `no-deep-imports`
 * @proves mui-no-deep-imports
 */

'use strict';

const { createRuleTester, tsx } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-deep-imports');

createRuleTester().run('no-deep-imports', rule, {
  valid: [
    "import { createTheme } from '@mui/material/styles';",
    "import Button from '@mui/material/Button';",
    "import { Button } from '@mui/material';",
    "import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';",
    "import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';",
    "import x from 'lodash/fp/map';",
    { code: "import x from '@mui/x-charts/internals/foo';", options: [{ allow: ['@mui/x-charts/internals'] }] },
  ],
  invalid: [
    {
      name: 'styles deep default import → named import',
      code: "import createTheme from '@mui/material/styles/createTheme';",
      output: "import { createTheme } from '@mui/material/styles';",
      errors: [{ messageId: 'deepImport', data: { source: '@mui/material/styles/createTheme' } }],
    },
    {
      name: 'styles deep default import keeps the local name',
      code: "import makeTheme from '@mui/material/styles/createTheme';",
      output: "import { createTheme as makeTheme } from '@mui/material/styles';",
      errors: [{ messageId: 'deepImport' }],
    },
    {
      name: 'module exported under a different name',
      code: "import THEME_ID from '@mui/material/styles/identifier';",
      output: "import { THEME_ID } from '@mui/material/styles';",
      errors: [{ messageId: 'deepImport' }],
    },
    {
      name: 'type-only deep import is reported, not rewritten (interfaces were renamed)',
      code: "import type { TypographyOptions } from '@mui/material/styles/createTypography';",
      output: null,
      languageOptions: tsx,
      errors: [{ messageId: 'deepImport' }],
    },
    {
      name: 'unknown styles module has no 1:1 replacement',
      code: "import createPalette from '@mui/material/styles/createPalette';",
      output: null,
      errors: [{ messageId: 'deepImport' }],
    },
    {
      name: 'TablePaginationActions moved to its own entry',
      code: "import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';",
      output: "import TablePaginationActions from '@mui/material/TablePaginationActions';",
      errors: [{ messageId: 'deepImport' }],
    },
    {
      name: 'icons esm path',
      code: "import Close from '@mui/icons-material/esm/Close';",
      output: "import Close from '@mui/icons-material/Close';",
      errors: [{ messageId: 'deepImport' }],
    },
    {
      name: 're-export and dynamic import are reported',
      code: "export { default } from '@mui/material/Button/Button';\nconst m = import('@mui/system/styleFunctionSx/styleFunctionSx');",
      output: null,
      errors: [{ messageId: 'deepImport' }, { messageId: 'deepImport' }],
    },
    {
      code: "export * from '@mui/material/internal/svg-icons';",
      output: null,
      errors: [{ messageId: 'deepImport' }],
    },
  ],
});
