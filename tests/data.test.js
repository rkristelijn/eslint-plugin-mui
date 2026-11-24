/**
 * @fileoverview Consistency of the migration data tables (ADR-004).
 * @proves ADR-004
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { SLOT_PROPS, MANUAL, codemodFor } = require('../lib/data/slot-props');
const {
  REMOVED_PROPS,
  REMOVED_EXPORTS,
  REMOVED_ICONS,
  LAB_MOVED,
  STYLES_DEFAULT_EXPORTS,
} = require('../lib/data/removed');
const { SYSTEM_PROPS, SYSTEM_PROP_COMPONENTS, SPACING_KEYS, BUTTON_LIKE } = require('../lib/data/system');

const PASCAL = /^[A-Z][A-Za-z0-9]*$/;

describe('slot-props table', () => {
  it('maps every prop to slots / slotProps (whole or keyed)', () => {
    for (const [component, props] of Object.entries(SLOT_PROPS)) {
      assert.match(component, PASCAL);
      for (const [prop, target] of Object.entries(props)) {
        assert.match(target, /^(slots|slotProps)(\.[a-z][A-Za-z]*)*$/, `${component}.${prop} → ${target}`);
        const isWhole = target === 'slots' || target === 'slotProps';
        assert.equal(isWhole, prop === 'components' || prop === 'componentsProps', `${component}.${prop}`);
        // a *Component prop moves into slots, or into a slot's own `component` prop
        if (prop.endsWith('Component'))
          assert.ok(target.startsWith('slots.') || target.endsWith('.component'), `${component}.${prop}`);
      }
    }
  });

  it('lists manual moves that exist in the table', () => {
    for (const key of MANUAL) {
      const [component, prop] = key.split('.');
      assert.ok(SLOT_PROPS[component] && SLOT_PROPS[component][prop], key);
    }
  });

  it('derives the official codemod name', () => {
    assert.equal(codemodFor('Dialog'), 'npx @mui/codemod@latest deprecations/dialog-props <path>');
    assert.equal(codemodFor('ListItemText'), 'npx @mui/codemod@latest deprecations/list-item-text-props <path>');
    assert.equal(codemodFor('SwipeableDrawer'), 'npx @mui/codemod@latest deprecations/drawer-props <path>');
  });
});

describe('removed table', () => {
  it('has a version and a hint for every removed prop and export', () => {
    for (const entries of [...Object.values(REMOVED_PROPS), REMOVED_EXPORTS]) {
      for (const [key, entry] of Object.entries(entries)) {
        assert.match(entry.since, /^v(7|9)$/, key);
        assert.ok(entry.hint.length > 5, key);
      }
    }
  });

  it('keys removed exports as <@mui source>#<name>', () => {
    for (const key of Object.keys(REMOVED_EXPORTS))
      assert.match(key, /^@mui\/[a-z-]+(\/[A-Za-z_0-9]+)*#[A-Za-z_0-9]+$/);
  });

  it('maps icons to replacements that are not themselves removed', () => {
    assert.equal(Object.keys(REMOVED_ICONS).length, 23, 'v9 removed exactly 23 *Outline icons');
    for (const [icon, replacement] of Object.entries(REMOVED_ICONS)) {
      assert.match(icon, /Outline$/);
      if (replacement !== null) assert.ok(!(replacement in REMOVED_ICONS), `${icon} → ${replacement}`);
    }
  });

  it('keeps lab moves and styles exports well-formed', () => {
    for (const name of LAB_MOVED) assert.match(name, /^(use)?[A-Z][A-Za-z]*$/);
    for (const exported of Object.values(STYLES_DEFAULT_EXPORTS)) assert.match(exported, /^[A-Za-z_]+$/);
  });
});

describe('system table', () => {
  it('only exempts props that are system props', () => {
    for (const [component, own] of Object.entries(SYSTEM_PROP_COMPONENTS)) {
      for (const prop of own) assert.ok(SYSTEM_PROPS.has(prop), `${component}.${prop}`);
    }
  });
  it('spacing keys are system props, and own Stack/Grid props are not', () => {
    for (const key of SPACING_KEYS) assert.ok(SYSTEM_PROPS.has(key), key);
    for (const own of ['spacing', 'direction', 'size', 'container']) assert.ok(!SYSTEM_PROPS.has(own), own);
  });
  it('lists the 14 button-like components of the v9 nativeButton change', () => {
    assert.equal(BUTTON_LIKE.size, 14);
  });
});
