# 🚀 @mono-app/eslint-config

> A powerful, opinionated ESLint and Prettier configuration for Svelte projects

[![npm version](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/package/@mono-app/eslint-config)
[![Svelte Ready](https://img.shields.io/badge/Svelte-Ready-ff3e00.svg)](https://svelte.dev)
[![Prettier](https://img.shields.io/badge/Code_Style-Prettier-ff69b4.svg)](https://prettier.io)

## ✨ Features

- **Zero configuration** setup for SvelteKit projects
- **Modern ESLint setup** using the latest ESLint v9 flat config system
- **Svelte-optimized** styling with specially configured Prettier plugins
- **TailwindCSS integration** for perfect class sorting
- **Custom rules** to improve your codebase quality

## 📦 Installation

```bash
# Using npm
npm install --save-dev @mono-app/eslint-config

# Using yarn
yarn add --dev @mono-app/eslint-config

# Using pnpm
pnpm add --save-dev @mono-app/eslint-config
```

## 🔧 Usage

### ESLint Configuration

Create an `eslint.config.js` file in your project root:

```javascript
import createConfig from '@mono-app/eslint-config';
import svelteConfig from './svelte.config.js';

export default createConfig({
	svelteConfig,
	// Optional: Add paths to ignore
	ignores: ['**/build/**', '**/node_modules/**']
});
```

### Prettier Configuration

Create a `.prettierrc.js` file in your project root:

```javascript
import prettierConfig from '@mono-app/eslint-config/prettier';

export default {
	...prettierConfig
	// Override any settings here if needed
};
```

## 🎯 What's Included

### ESLint Setup

- 📝 All recommended ESLint rules
- 🧩 Svelte-specific rules and parser
- 🔗 Integration with Prettier
- 🌐 Browser and Node.js globals
- 🛠️ Custom rules:
    - `no-relative-lib-imports`: Enforces usage of `$lib` alias instead of relative paths

### Prettier Configuration

- Tabs for indentation
- Single quotes
- 100 character line width
- No trailing commas
- Svelte-specific formatting
- TailwindCSS class sorting

## 🧰 Custom Rules

### no-relative-lib-imports

This rule prevents using relative imports for files inside `src/lib` and encourages the use of the `$lib` alias instead. This makes imports cleaner and more maintainable across your project.

✅ Correct usage:

```javascript
import { Button } from '$lib/components/Button.svelte';
```

❌ Incorrect usage:

```javascript
import { Button } from '../../lib/components/Button.svelte';
```
