// eslint-rules/no-relative-lib-imports.js
import { resolve, relative, dirname } from 'node:path';

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow relative imports for files inside src/lib—use the $lib alias instead, except for imports from the same folder.',
			category: 'Best Practices',
			recommended: true
		},
		messages: {
			noRelativeLibImport: 'Use $lib instead of a relative path when importing from src/lib.'
		},
		schema: [] // no options
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const importPath = node.source.value;
				// Only inspect relative paths.
				if (typeof importPath !== 'string' || !importPath.startsWith('.')) {
					return;
				}

				// Get the file where this import is declared.
				const currentFilename = context.getFilename();
				// Sometimes, ESLint might pass a dummy name (e.g. '<input>').
				if (!currentFilename || currentFilename === '<input>') {
					return;
				}

				const importerDir = dirname(currentFilename);
				// Resolve the absolute path of the imported file.
				const resolvedImportPath = resolve(importerDir, importPath);

				// Check if the import is from the same directory
				if (importPath.startsWith('./') && !importPath.slice(2).includes('/')) {
					// The import is from the same directory, so skip the check
					return;
				}

				// Define the absolute path to the src/lib folder.
				// Assumes your project root is process.cwd(), adjust if needed.
				const libDir = resolve(process.cwd(), 'src', 'lib');

				// Check if the resolved path is located within libDir:
				// relative(libDir, resolvedImportPath) does not start with '..'
				// if and only if resolvedImportPath is inside libDir.
				if (!relative(libDir, resolvedImportPath).startsWith('..')) {
					context.report({
						node,
						messageId: 'noRelativeLibImport'
					});
				}
			}
		};
	}
};