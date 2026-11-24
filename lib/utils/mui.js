/**
 * @fileoverview Shared helpers: resolve which MUI component a JSX element is,
 * regardless of how it was imported (barrel, path import, alias).
 * @implements ADR-003.import-resolution
 */

'use strict';

/** Packages whose components share the same import layout. */
const COMPONENT_PACKAGES = new Set(['@mui/material', '@mui/system', '@mui/lab', '@mui/joy']);

const BARREL_RE = /^@mui\/([a-z-]+)$/;
const PATH_RE = /^@mui\/([a-z-]+)\/([^/]+)$/;

/**
 * Normalise an exported name to its canonical component name.
 * `Unstable_Grid2` was the pre-v6 name for `Grid2`.
 * @param {string} name exported or path-segment name
 * @returns {string}
 */
function canonicalName(name) {
  return name === 'Unstable_Grid2' ? 'Grid2' : name;
}

/**
 * Is `source` an MUI package we resolve components from?
 * @param {string} source import source
 * @returns {boolean}
 */
function isMuiSource(source) {
  return typeof source === 'string' && source.startsWith('@mui/');
}

/**
 * Split an MUI import source into package + optional sub path.
 * @param {string} source e.g. '@mui/material/Button'
 * @returns {{ pkg: string, path: string[] } | null}
 */
function parseSource(source) {
  if (!isMuiSource(source)) return null;
  const [scope, name, ...path] = source.split('/');
  return { pkg: `${scope}/${name}`, path };
}

/**
 * The name an import specifier imports (`default` for default imports).
 * @param {import('estree').ImportDeclaration['specifiers'][number]} spec
 * @returns {string}
 */
function importedName(spec) {
  if (spec.type === 'ImportDefaultSpecifier') return 'default';
  if (spec.type === 'ImportNamespaceSpecifier') return '*';
  return spec.imported.type === 'Identifier' ? spec.imported.name : String(spec.imported.value);
}

/**
 * Which component does this specifier bind, if any?
 * @param {string} source import source
 * @param {object} spec import specifier
 * @returns {string | null} canonical component name
 */
function componentOf(source, spec) {
  const barrel = BARREL_RE.exec(source);
  if (barrel && COMPONENT_PACKAGES.has(`@mui/${barrel[1]}`) && spec.type === 'ImportSpecifier') {
    return canonicalName(importedName(spec));
  }
  const path = PATH_RE.exec(source);
  if (path && COMPONENT_PACKAGES.has(`@mui/${path[1]}`) && spec.type === 'ImportDefaultSpecifier') {
    return canonicalName(path[2]);
  }
  return null;
}

/**
 * Collect every MUI import binding in a program, keyed by local name.
 * Scans the program body up front so JSX before a late import still resolves.
 * @param {import('estree').Program} program
 * @returns {Map<string, { source: string, imported: string, component: string | null, specifier: object, declaration: object }>}
 */
function collectMuiImports(program) {
  const bindings = new Map();
  for (const statement of program.body) {
    if (statement.type !== 'ImportDeclaration' || !isMuiSource(statement.source.value)) continue;
    for (const spec of statement.specifiers) {
      bindings.set(spec.local.name, {
        source: statement.source.value,
        imported: importedName(spec),
        component: componentOf(statement.source.value, spec),
        specifier: spec,
        declaration: statement,
      });
    }
  }
  return bindings;
}

/**
 * Resolve the MUI component a JSX opening element renders.
 * @param {object} openingElement JSXOpeningElement
 * @param {Map} bindings result of collectMuiImports
 * @returns {string | null} canonical component name, or null when not MUI
 */
function resolveJsxComponent(openingElement, bindings) {
  const name = openingElement.name;
  if (!name || name.type !== 'JSXIdentifier') return null;
  const binding = bindings.get(name.name);
  return binding ? binding.component : null;
}

/**
 * Find a JSX attribute by name on an opening element.
 * @param {object} openingElement JSXOpeningElement
 * @param {string} attrName
 * @returns {object | undefined} JSXAttribute
 */
function getAttribute(openingElement, attrName) {
  return openingElement.attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier' && attr.name.name === attrName,
  );
}

/**
 * Does the element spread props (`{...props}`)? Then we cannot know all props.
 * @param {object} openingElement JSXOpeningElement
 * @returns {boolean}
 */
function hasSpread(openingElement) {
  return openingElement.attributes.some((attr) => attr.type === 'JSXSpreadAttribute');
}

/**
 * Name of a JSX attribute (`null` for spreads / namespaced names).
 * @param {object} attr JSXAttribute | JSXSpreadAttribute
 * @returns {string | null}
 */
function attributeName(attr) {
  return attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier' ? attr.name.name : null;
}

/**
 * Source text of an attribute value as a JS expression: `"x"` → `"x"`,
 * `{2}` → `2`, bare boolean attribute → `true`.
 * @param {object} attr JSXAttribute
 * @param {object} sourceCode
 * @returns {string}
 */
function attributeValueText(attr, sourceCode) {
  if (attr.value === null) return 'true';
  if (attr.value.type === 'JSXExpressionContainer') return sourceCode.getText(attr.value.expression);
  return sourceCode.getText(attr.value);
}

/**
 * Static string value of an attribute (`size="normal"` / `size={'normal'}`).
 * @param {object} attr JSXAttribute
 * @returns {string | null}
 */
function attributeStringValue(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') return attr.value.value;
  const expr = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;
  if (expr && expr.type === 'Literal' && typeof expr.value === 'string') return expr.value;
  if (expr && expr.type === 'TemplateLiteral' && expr.expressions.length === 0) return expr.quasis[0].value.cooked;
  return null;
}

/**
 * Range that removes an attribute together with the whitespace before it.
 * @param {object} attr JSXAttribute
 * @param {object} sourceCode
 * @returns {[number, number]}
 */
function attributeRemovalRange(attr, sourceCode) {
  const before = sourceCode.getTokenBefore(attr);
  return [before.range[1], attr.range[1]];
}

module.exports = {
  attributeName,
  attributeRemovalRange,
  attributeStringValue,
  attributeValueText,
  collectMuiImports,
  getAttribute,
  hasSpread,
  importedName,
  isMuiSource,
  parseSource,
  resolveJsxComponent,
};
