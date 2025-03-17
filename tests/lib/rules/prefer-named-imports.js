/**
 * @fileoverview Tests for `prefer-named-imports` rule
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/prefer-named-imports');

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('prefer-named-imports', rule, {
  valid: [
    {
      code: `import { Close } from '@mui/icons-material';`,
    },
    {
      code: `import { ChevronLeft, ChevronRight } from '@mui/icons-material';`,
    },
    {
      code: `import SomethingElse from 'some-other-library';`, // Should be valid
    },
    {
      code: `
import { Add } from '@mui/icons-material';
const MyComponent = () => <Add />;
      `, // JSX usage is already correct
    },
  ],

  invalid: [
    {
      code: `
import CloseIcon from '@mui/icons-material/Close';
const MyComponent = () => <CloseIcon />;
      `,
      output: `
import { Close } from '@mui/icons-material';
const MyComponent = () => <Close />;
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <CloseIcon /> with <Close />' },
      ],
    },
    {
      code: `
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
const MyComponent = () => <ChevronLeftIcon />;
      `,
      output: `
import { ChevronLeft } from '@mui/icons-material';
const MyComponent = () => <ChevronLeft />;
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <ChevronLeftIcon /> with <ChevronLeft />' },
      ],
    },
    {
      code: `
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const MyComponent = () => <ChevronRightIcon />;
      `,
      output: `
import { ChevronRight } from '@mui/icons-material';
const MyComponent = () => <ChevronRight />;
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <ChevronRightIcon /> with <ChevronRight />' },
      ],
    },
    {
      code: `
import AddIcon from '@mui/icons-material/Add';
const MyComponent = () => <AddIcon />;
      `,
      output: `
import { Add } from '@mui/icons-material';
const MyComponent = () => <Add />;
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <AddIcon /> with <Add />' },
      ],
    },
    {
      code: `
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';`,
      output: `
import { PersonOutlineOutlined, Settings, HelpOutline } from '@mui/icons-material';
`,
      errors: [{ message: 'Use named imports for MUI icons instead of default imports.' }],
    },
    {
      code: `
import CloseIcon from '@mui/icons-material/Close';
import { Snackbar, LinearProgress, Alert, IconButton, Typography, Stack, AlertTitle } from '@mui/material';
const MyComponent = () => (
  <IconButton size='small' aria-label='close' color='inherit' onClick={() => {}}>
    <CloseIcon fontSize='small' />
  </IconButton>
);
      `,
      output: `
import { Close } from '@mui/icons-material';
import { Snackbar, LinearProgress, Alert, IconButton, Typography, Stack, AlertTitle } from '@mui/material';
const MyComponent = () => (
  <IconButton size='small' aria-label='close' color='inherit' onClick={() => {}}>
    <Close fontSize='small' />
  </IconButton>
);
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <CloseIcon /> with <Close />' },
      ],
    },
    {
      code: `
import CloseIcon from '@mui/icons-material/Close';
const MyComponent = () => (
  <div>
    <span>Close the dialog</span>
    <CloseIcon />
  </div>
);
      `,
      output: `
import { Close } from '@mui/icons-material';
const MyComponent = () => (
  <div>
    <span>Close the dialog</span>
    <Close />
  </div>
);
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <CloseIcon /> with <Close />' },
      ],
    },
    {
      code: `
import CloseIcon from '@mui/icons-material/Close';
const MyComponent = () => (
  <Alert icon={<CloseIcon />} severity="error">
    This is an error alert.
  </Alert>
);
      `,
      output: `
import { Close } from '@mui/icons-material';
const MyComponent = () => (
  <Alert icon={<Close />} severity="error">
    This is an error alert.
  </Alert>
);
      `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <CloseIcon /> with <Close />' },
      ],
    },
    {
      code: `
import CloseIcon from '@mui/icons-material/Close';
const MyComponent = () => (
  <Alert icon={<CloseIcon />} severity="error"
    action={
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={() => {}}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    }
  >
    This is an error alert.
  </Alert>
);`,
      output: `
import { Close } from '@mui/icons-material';
const MyComponent = () => (
  <Alert icon={<Close />} severity="error"
    action={
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={() => {}}
      >
        <Close fontSize="inherit" />
      </IconButton>
    }
  >
    This is an error alert.
  </Alert>
);`,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <CloseIcon /> with <Close />' },
        { message: 'Replace <CloseIcon /> with <Close />' },
      ],
    },
    {
      code: `
import { Button } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const MyComponent = () => (
  <>
    <Button
      variant="outlined"
      startIcon={<ChevronLeftIcon />}
      disabled={false}
    >
      Previous
    </Button>

    <Button
      variant="contained"
      endIcon={<ChevronRightIcon />}
    >
      Next
    </Button>
  </>
);
  `,
      output: `
import { Button } from '@mui/material';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
const MyComponent = () => (
  <>
    <Button
      variant="outlined"
      startIcon={<ChevronLeft />}
      disabled={false}
    >
      Previous
    </Button>

    <Button
      variant="contained"
      endIcon={<ChevronRight />}
    >
      Next
    </Button>
  </>
);
  `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <ChevronLeftIcon /> with <ChevronLeft />' },
        { message: 'Replace <ChevronRightIcon /> with <ChevronRight />' },
      ],
    },
    {
      code: `
import { FC } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface MyComponentProps {
  label: string;
}

const MyComponent: FC<MyComponentProps> = ({ label }) => {
  return (
    <Button startIcon={<AddIcon />}>
      {label}
    </Button>
  );
};

export default MyComponent;
  `,
      output: `
import { FC } from 'react';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
interface MyComponentProps {
  label: string;
}

const MyComponent: FC<MyComponentProps> = ({ label }) => {
  return (
    <Button startIcon={<Add />}>
      {label}
    </Button>
  );
};

export default MyComponent;
  `,
      errors: [
        { message: 'Use named imports for MUI icons instead of default imports.' },
        { message: 'Replace <AddIcon /> with <Add />' },
      ],
    },
  ],
});
