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

        // Prevent duplicate reporting
        if (node.parent.type === 'JSXOpeningElement' || node.parent.type === 'JSXClosingElement') {
          context.report({
            node,
            messageId: 'replaceJsx',
            data: { oldName: node.name, newName },
            fix(fixer) {
              return fixer.replaceText(node, newName);
            },
          });

          // Remove from map to prevent multiple reports
          iconFixes.delete(node.name);
        }
      },

      'Program:exit'(programNode) {
        const sourceCode = context.getSourceCode();
        const allImports = programNode.body.filter((node) => node.type === 'ImportDeclaration');
        const muiImports = allImports.filter((node) => node.source.value.startsWith('@mui/icons-material'));

        if (namedImports.size > 0) {
          // Step 1: Replace JSX Identifiers First
          for (const [oldName, newName] of iconFixes) {
            programNode.body.forEach((node) => {
              sourceCode.getTokens(node).forEach((token) => {
                if (token.value === oldName) {
                  context.report({
                    node,
                    messageId: 'replaceJsx',
                    data: { oldName, newName },
                    fix: (fixer) => fixer.replaceText(token, newName),
                  });
                }
              });
            });
          }

          // Step 2: Only report import fixes in a separate loop
          if (muiImports.length > 0) {
            const lastMuiImport = muiImports[muiImports.length - 1];
            let insertPosition = lastMuiImport.range[1];

            const importStatement = `import { ${[...namedImports].join(', ')} } from '@mui/icons-material';\n`;

            context.report({
              node: programNode,
              messageId: 'useNamedImport',
              fix(fixer) {
                const fixes = [];

                // Remove old imports **only after JSX replacements have been scheduled**
                muiImports.forEach((importNode) => {
                  fixes.push(fixer.remove(importNode));
                });

                // Insert the new import statement after the last MUI import
                fixes.push(fixer.insertTextBeforeRange([insertPosition, insertPosition], importStatement));

                return fixes;
              },
            });
          }
        }
      },
    };
  },
};
