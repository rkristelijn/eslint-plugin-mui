/**
 * @fileoverview Tests for `no-literal-colors` rule
 * @proves mui-no-literal-colors
 * @autor rkristelijn
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-literal-colors');

const ruleTester = createRuleTester();

ruleTester.run('no-literal-colors', rule, {
  valid: [
    "<Box sx={{ backgroundColor: { xs: 'primary.main', md: 'grey.100' }, color: ['text.primary', 'inherit'] }} />;",
    // 2.0: theme tokens in the newly covered keys stay valid
    "<Box sx={{ bgcolor: 'primary.main', borderColor: 'divider', fill: 'currentColor' }} />;",
    "<Box sx={{ color: '#12345' }} />;",
    "<Box style={{ backgroundColor: '#fff' }} />;",
    {
      code: `
        var Header = (
          <Box
            sx={{
              color: 'primary.main',
            }}
          />
        );
      `,
    },
    {
      code: `
        var Header = (
          <Box
            sx={{
              backgroundColor: 'primary.main',
            }}
          />
        );
      `,
    },
  ],

  invalid: [
    {
      code: `
        var Header = (
          <Box
            sx={{
              color: '#FFF',
            }}
          />
        );
      `,
      errors: [
        {
          messageId: 'noLiteralColors',
          data: {
            value: '#fff',
          },
        },
      ],
    },
    {
      code: `
        var Header = (
          <Box
            sx={{
              color: '#123456',
            }}
          />
        );
      `,
      errors: [
        {
          messageId: 'noLiteralColors',
          data: {
            value: '#123456',
          },
        },
      ],
    },
    {
      code: `
        var Header = (
          <Box
            sx={{
              color: 'red',
            }}
          />
        );
      `,
      errors: [
        {
          messageId: 'noLiteralColors',
          data: {
            value: 'red',
          },
        },
      ],
    },
    {
      code: `
        var Header = (
          <Box
            sx={{
              color: 'black',
            }}
          />
        );
      `,
      errors: [
        {
          messageId: 'noLiteralColors',
          data: {
            value: 'black',
          },
        },
      ],
    },
    {
      code: `
        var Header = (
          <Box
            sx={{
              color: 'aliceblue',
            }}
          />
        );
      `,
      errors: [
        {
          messageId: 'noLiteralColors',
          data: {
            value: 'aliceblue',
          },
        },
      ],
    },
    // 2.0: more color keys and formats
    {
      name: 'responsive object, array and conditional color values',
      code: "<Box sx={{ backgroundColor: { xs: '#fff', md: 'primary.main' }, color: ['red', 'inherit'], borderColor: on ? 'blue' : 'divider' }} />;",
      errors: [
        { messageId: 'noLiteralColors', data: { value: '#fff' } },
        { messageId: 'noLiteralColors', data: { value: 'red' } },
        { messageId: 'noLiteralColors', data: { value: 'blue' } },
      ],
    },
    ...[
      ["bgcolor: '#fff'", '#fff'],
      ["backgroundColor: '#ffffff80'", '#ffffff80'],
      ["borderColor: 'rgb(0, 0, 0)'", 'rgb(0, 0, 0)'],
      ["'color': 'hsla(0, 0%, 0%, .5)'", 'hsla(0, 0%, 0%, .5)'],
      ["fill: 'Red'", 'red'],
      ["outlineColor: 'oklch(70% 0.1 200)'", 'oklch(70% 0.1 200)'],
    ].map(([prop, value]) => ({
      code: `<Box sx={{ ${prop} }} />;`,
      errors: [{ messageId: 'noLiteralColors', data: { value } }],
    })),
  ],
});
