/**
 * @fileoverview Rule to avoid default imports for MUI icons
 * @author rkristelijn
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce named imports for MUI icons',
      recommended: true,
      url: 'https://github.com/rkristelijn/eslint-plugin-mui/tree/main/docs/rules/prefer-named-imports.md',
    },
    fixable: 'code',
    messages: {
      useNamedImport: 'Use named imports for MUI icons instead of default imports.',
      replaceJsx: 'Replace <{{ oldName }} /> with <{{ newName }} />',
    },
    schema: [],
  },

  create(context) {
    const iconFixes = new Map(); // Store mappings for JSX replacements
    const namedImports = new Set(); // Store unique named imports
    const muiImportNodes = new Set(); // Track import declaration nodes to remove

    return {
      ImportDeclaration(node) {
        if (node.source.value.startsWith('@mui/icons-material/')) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportDefaultSpecifier') {
              const oldName = specifier.local.name;
              const newName = oldName.replace(/Icon$/, ''); // Convert "CloseIcon" → "Close"

              // Store JSX mapping
              iconFixes.set(oldName, newName);
              namedImports.add(newName);
              muiImportNodes.add(node); // Mark for deletion
            }
          });
        }
      },

      JSXIdentifier(node) {
        if (!iconFixes.has(node.name)) return;

        const newName = iconFixes.get(node.name);

        if (
          node.parent.type === 'JSXOpeningElement' ||
          (node.parent.type === 'JSXExpressionContainer' && node.parent.parent.type === 'JSXAttribute')
        ) {
          context.report({
            node,
            messageId: 'replaceJsx',
            data: { oldName: node.name, newName },
            fix(fixer) {
              return fixer.replaceText(node, newName);
            },
          });
        }
      },

      'Program:exit'(programNode) {
        if (namedImports.size > 0) {
          const sourceCode = context.getSourceCode();
          const allImports = programNode.body.filter((node) => node.type === 'ImportDeclaration');
          const muiImports = allImports.filter((node) => node.source.value.startsWith('@mui/icons-material'));

          if (muiImports.length === 0) return;

          const lastMuiImport = muiImports[muiImports.length - 1];

          // Insert **after** the last MUI import
          let insertPosition = lastMuiImport.range[1];

          // Ensure no double newlines when inserting
          const importStatement = `import { ${[...namedImports].join(', ')} } from '@mui/icons-material';\n`;

          context.report({
            node: programNode,
            messageId: 'useNamedImport',
            fix(fixer) {
              const fixes = [];

              // Remove old **MUI** imports while preserving non-MUI ones
              muiImports.forEach((importNode) => {
                fixes.push(fixer.remove(importNode));
              });

              // **Fix: Ensure new import is inserted cleanly**
              // Trim unnecessary newlines before inserting
              const previousToken = sourceCode.getTokenBefore(lastMuiImport, { includeComments: true });
              if (previousToken && previousToken.loc.end.line < lastMuiImport.loc.start.line - 1) {
                insertPosition = previousToken.range[1]; // Adjust to avoid double blank lines
              }

              // Insert the new import statement **right after** last MUI import
              fixes.push(fixer.insertTextBeforeRange([insertPosition, insertPosition], importStatement));

              return fixes;
            },
          });
        }
      },
    };
  },
};
