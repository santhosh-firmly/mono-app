# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Lerna-managed monorepo containing frontend applications for the Firmly payment ecosystem, built with Svelte 5 and SvelteKit, deployed to Cloudflare Workers.

## Project Structure

- **packages/dropin-service** - Main payment drop-in widget application (v4/v5 architecture)
- **packages/dash** - Dashboard application
- **packages/eslint-config** - Shared ESLint and Prettier configuration

### dropin-service Architecture

The dropin-service has two parallel architectures:

- **lib-v4/** - Legacy v4 implementation with SDK bundling capability
- **lib/** - Current implementation
- **routes/(v4)/** - v4 routes
- **routes/v5/** - v5 routes with single-page flow

The project uses path aliases: `$lib` (src/lib), `$lib-v4` (src/lib-v4), and `$dist` (dist).

## Common Commands

### Installation
```bash
npm install
```

### Development
```bash
# Start dev server for a specific package
npm run dev --workspace dropin-service
npm run dev --workspace dash

# Run Storybook (dropin-service only)
npm run storybook --workspace dropin-service
```

### Testing
```bash
# Run all tests across packages
npm test

# Run tests for a specific package
npm test --workspace dropin-service

# Run unit tests (dropin-service)
npm run test:unit --workspace dropin-service
```

### Building
```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace dropin-service

# Build for specific environments (dropin-service/dash)
npm run build-dev
npm run build-ci
npm run build-qa
npm run build-uat
npm run build-prod
```

### SDK Building (dropin-service only)
The dropin-service includes a custom SDK build step that bundles `src/lib-v4/sdk/index.js` into `dist/sdk/js` using esbuild:
```bash
npm run build-sdk --workspace dropin-service
```

### Code Quality
```bash
# Format and lint all code
npm run format-code

# Check outdated dependencies
npm run outdated

# Check for unused dependencies
npm run depcheck
```

### Deployment
```bash
# Deploy to specific environment (dropin-service/dash)
npm run deploy-dev
npm run deploy-ci
npm run deploy-qa
npm run deploy-uat
npm run deploy-prod
```

### Version Management
```bash
# Update versions across all packages
npm run update-version

# Update without commit hooks
npm run update-version-no-hooks
```

## Development Guidelines

### Svelte 5 Runes
This codebase uses Svelte 5 with runes:
- `$state` - Reactive state declaration
- `$derived` - Computed derived values
- `$effect` - Side effects and lifecycle management
- `$props` - Component props declaration
- `$bindable` - Two-way bindable props

### State Management
Use classes for complex state management (state machines):
```javascript
// counter.svelte.js
class Counter {
  count = $state(0);
  increment() { this.count++; }
}
export const counter = new Counter();
```

### Internationalization
Uses Paraglide.js for i18n:
- Messages are defined in `messages/en.json`
- Import with `import * as m from '$lib/paraglide/messages.js'`
- Use in templates: `{m('welcome_message')}`

### Component Naming
- File names: lowercase-with-hyphens (e.g., `auth-form.svelte`)
- Imports/usage: PascalCase
- Variables/functions: camelCase

### Styling
- Uses Tailwind CSS (v4 for dropin-service, v3 for dash)
- dropin-service uses `@tailwindcss/vite` plugin
- Leverage Svelte's built-in transitions and animations

## Testing

The dropin-service uses Vitest with two separate workspaces:
- **client workspace**: Tests Svelte components using jsdom environment
  - Files: `src/**/*.svelte.{test,spec}.{js,ts}`
  - Excludes: `src/lib/server/**`
- **server workspace**: Tests server-side code in Node environment
  - Files: `src/**/*.{test,spec}.{js,ts}`
  - Excludes: `src/**/*.svelte.{test,spec}.{js,ts}`

## Pre-commit Hooks

Husky enforces the following checks before each commit:
1. Check for outdated dependencies (`npm run outdated`)
2. Check for unused/unlisted dependencies (`npm run depcheck`)
3. Format code in changed packages (`lerna run format-code --since origin/main`)
4. Check for `.only` or `fit()` in test files
5. Build changed packages (`lerna run build --since origin/main`)
6. Run tests on changed packages (`lerna run test:static --since origin/main`)

## Cloudflare Deployment

Both applications use `@sveltejs/adapter-cloudflare` and are deployed to Cloudflare Workers:
- Development preview: `npm run preview:cloudflare --workspace dropin-service`
- Uses Wrangler CLI for deployments
- Environment-specific configurations via `--env` flag

## Key Dependencies

- **Svelte 5** - Component framework
- **SvelteKit 2** - Application framework with SSR/SSG
- **Paraglide.js** - Internationalization
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Testing framework
- **Storybook** - Component development (dropin-service)
- **Lerna** - Monorepo management
- **esbuild** - SDK bundling (dropin-service)

## SvelteKit Patterns

### Routing
- File-based routing in `src/routes/`
- Dynamic routes use `[slug]` syntax
- Load functions for server-side data fetching
- Error handling with `+error.svelte` pages

### Forms and Actions
- Server-side form handling with SvelteKit form actions
- Client-side validation using Svelte's reactive declarations
- Progressive enhancement for JavaScript-optional submissions

## Important Notes

- The dropin-service maintains two parallel implementations (v4 and v5)
- Always run the SDK build step for dropin-service before building
- The pre-commit hook runs checks only on packages changed since `origin/main`
- Main branch for PRs: `main`
- Shared ESLint/Prettier config is maintained in `@firmly/eslint-config` package
