/**
 * @fileoverview Unit tests for the shared helpers.
 * @proves ADR-003.import-resolution ADR-003.object-prop-merge ADR-003.single-child
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Linter } = require('eslint');
const { collectMuiImports, resolveJsxComponent, parseSource, attributeStringValue } = require('../lib/utils/mui');
const { mergeIntoObjectAttribute, renderEntries } = require('../lib/utils/fix');
const { hasSingleStaticChild } = require('../lib/utils/single-child');

/**
 * Parse code and hand every JSXOpeningElement / JSXElement to a callback.
 * @param {string} code
 * @param {(ctx: { program: object, sourceCode: object, node: object }) => void} visit
 * @param {string} selector AST selector
 * @returns {object[]} messages
 */
function walk(code, visit, selector = 'JSXOpeningElement') {
  const linter = new Linter();
  let program = null;
  return linter.verify(
    code,
    {
      languageOptions: { sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: {
        t: {
          rules: {
            probe: {
              meta: { fixable: 'code' },
              create: (context) => ({
                Program: (node) => {
                  program = node;
                },
                [selector]: (node) => visit({ program, sourceCode: context.sourceCode, node, context }),
              }),
            },
          },
        },
      },
      rules: { 't/probe': 'error' },
    },
    { filename: 'x.js' },
  );
}

describe('import resolution', () => {
  const resolve = (code) => {
    const found = [];
    walk(code, ({ program, node }) => found.push(resolveJsxComponent(node, collectMuiImports(program))));
    return found;
  };

  it('resolves barrel, path, alias and Unstable_Grid2 imports', () => {
    const code = `import { Box, Grid2 as G } from '@mui/material';
import Stack from '@mui/system/Stack';
import Legacy from '@mui/material/Unstable_Grid2';
import { Alert } from '@mui/lab';
<><Box /><G /><Stack /><Legacy /><Alert /></>;`;
    assert.deepEqual(resolve(code), ['Box', 'Grid2', 'Stack', 'Grid2', 'Alert']);
  });

  it('ignores non-MUI and unknown bindings, member expressions and named path imports', () => {
    const code = `import { Box } from 'other';
import { gridClasses } from '@mui/material/Grid';
import * as M from '@mui/material';
const Local = 1;
<><Box /><Local /><M.Box /><gridClasses /></>;`;
    assert.deepEqual(resolve(code), [null, null, null, null]);
  });

  it('resolves JSX that appears before a late import', () => {
    const code = `const A = () => <Box />;
import { Box } from '@mui/material';`;
    assert.deepEqual(resolve(code), ['Box']);
  });

  it('parses MUI sources into package and path', () => {
    assert.deepEqual(parseSource('@mui/material/styles/createTheme'), {
      pkg: '@mui/material',
      path: ['styles', 'createTheme'],
    });
    assert.equal(parseSource('react'), null);
  });

  it('reads static string attribute values in every literal form', () => {
    const values = [];
    walk(`<><a s="x" /><a s={'y'} /><a s={\`z\`} /><a s={v} /><a s /></>;`, ({ node }) => {
      if (node.attributes[0]) values.push(attributeStringValue(node.attributes[0]));
    });
    assert.deepEqual(values, ['x', 'y', 'z', null, null]);
  });
});

describe('object prop merge', () => {
  /** Apply mergeIntoObjectAttribute on the first element's `move` attrs. */
  const merge = (code, entries) => {
    const linter = new Linter();
    const config = {
      languageOptions: { sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: {
        t: {
          rules: {
            probe: {
              meta: { fixable: 'code' },
              create: (context) => ({
                JSXOpeningElement(node) {
                  const remove = node.attributes.filter((a) => a.name && a.name.name.startsWith('move'));
                  context.report({
                    node,
                    message: 'x',
                    fix: (fixer) =>
                      mergeIntoObjectAttribute({
                        fixer,
                        sourceCode: context.sourceCode,
                        element: node,
                        attrName: 'sx',
                        entries,
                        remove,
                      }),
                  });
                },
              }),
            },
          },
        },
      },
      rules: { 't/probe': 'error' },
    };
    return linter.verifyAndFix(code, config, { filename: 'x.js' }).output;
  };
  const entry = [{ key: 'mt', text: '2' }];

  it('creates the object prop in place of the first moved attribute', () => {
    assert.equal(merge('<a moveA={1} b moveB={2} />;', entry), '<a sx={{ mt: 2 }} b />;');
  });
  it('appends to an existing object literal', () => {
    assert.equal(merge('<a sx={{ p: 1 }} moveA={1} />;', entry), '<a sx={{ p: 1, mt: 2 }} />;');
  });
  it('fills an empty object literal', () => {
    assert.equal(merge('<a sx={{}} moveA={1} />;', entry), '<a sx={{ mt: 2 }} />;');
  });
  it('refuses a non-literal target and a duplicate key', () => {
    assert.equal(merge('<a sx={s} moveA={1} />;', entry), '<a sx={s} moveA={1} />;');
    assert.equal(merge('<a sx={{ mt: 1 }} moveA={1} />;', entry), '<a sx={{ mt: 1 }} moveA={1} />;');
  });
  it('renders spreads and raw members', () => {
    assert.equal(
      renderEntries([
        { key: null, text: 'x' },
        { key: 'k', raw: "k: 'v'" },
        { key: 'a', text: '1' },
      ]),
      "...x, k: 'v', a: 1",
    );
  });
});

describe('single static child', () => {
  const check = (code) => {
    const out = [];
    walk(code, ({ node }) => out.push(hasSingleStaticChild(node)), 'JSXElement[openingElement.name.name="P"]');
    return out;
  };

  it('counts one element, text, or a fragment around one element as single', () => {
    assert.deepEqual(check('<><P><a /></P><P>text</P><P><><a /></></P></>;'), [true, true, true]);
  });
  it('never counts expressions, empty, or several children as single', () => {
    assert.deepEqual(check('<><P>{xs.map(f)}</P><P /><P><a /><b /></P><P><><a /><b /></></P><P>{/* c */}</P></>;'), [
      false,
      false,
      false,
      false,
      false,
    ]);
  });
});
