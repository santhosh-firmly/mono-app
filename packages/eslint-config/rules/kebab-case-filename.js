import { basename } from 'node:path';

/**
 * Checks if a string is in kebab-case format.
 * Allows: lowercase letters, numbers, hyphens, dots (for extensions), and plus signs (for SvelteKit routes like +page.svelte)
 * Disallows: uppercase letters, underscores, spaces
 *
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is in kebab-case
 */
function isKebabCase(str) {
	// Remove extension(s) for checking (e.g., .svelte.js, .stories.svelte)
	const nameWithoutExtension = str.replace(/(\.[a-z0-9]+)+$/i, '');

	// Allow files starting with + (SvelteKit conventions: +page.svelte, +layout.js, etc.)
	// Allow files starting with . (hidden files like .eslintrc)
	// Allow files starting with _ (private/internal files convention)
	// Allow files that are just extensions (like .gitignore)
	if (nameWithoutExtension.startsWith('+') || nameWithoutExtension.startsWith('.') || nameWithoutExtension.startsWith('_') || !nameWithoutExtension) {
		return true;
	}

	// Check for uppercase letters or underscores (not allowed in kebab-case)
	if (/[A-Z_]/.test(nameWithoutExtension)) {
		return false;
	}

	// Valid kebab-case: lowercase letters, numbers, and hyphens
	return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExtension);
}

export default {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce kebab-case naming for source code files',
			category: 'Stylistic Issues',
			recommended: true
		},
		messages: {
			notKebabCase:
				'Filename "{{filename}}" is not in kebab-case. Use lowercase letters separated by hyphens (e.g., "my-component.js").'
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoredPatterns: {
						type: 'array',
						items: { type: 'string' },
						default: []
					}
				},
				additionalProperties: false
			}
		]
	},
	create(context) {
		return {
			Program(node) {
				const filename = context.getFilename();

				// Skip if filename is not available or is a dummy name
				if (!filename || filename === '<input>' || filename === '<text>') {
					return;
				}

				const baseFilename = basename(filename);

				// Get ignored patterns from options
				const options = context.options[0] || {};
				const ignoredPatterns = options.ignoredPatterns || [];

				// Check if filename matches any ignored pattern
				for (const pattern of ignoredPatterns) {
					if (new RegExp(pattern).test(baseFilename)) {
						return;
					}
				}

				// Skip common config files that don't follow kebab-case
				const configFilePatterns = [
					/^\./, // Hidden files (.eslintrc, .gitignore, etc.)
					/^[A-Z]+\.[a-z]+$/, // All-caps files like README.md, LICENSE.txt
					/^[A-Z][A-Z_]+$/, // All-caps without extension like LICENSE, CHANGELOG
					/^Dockerfile/, // Dockerfile
					/^Makefile$/, // Makefile
					/^Procfile$/, // Procfile
					/^Gemfile$/, // Gemfile
					/^Rakefile$/, // Rakefile
					/^CLAUDE\.md$/i // CLAUDE.md
				];

				for (const pattern of configFilePatterns) {
					if (pattern.test(baseFilename)) {
						return;
					}
				}

				if (!isKebabCase(baseFilename)) {
					context.report({
						node,
						messageId: 'notKebabCase',
						data: {
							filename: baseFilename
						}
					});
				}
			}
		};
	}
};
