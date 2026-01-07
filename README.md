# Firmly Frontend Monorepo

Lerna-managed monorepo for Firmly frontend applications. Built with Svelte 5, SvelteKit, and deployed to Cloudflare Workers.

## Packages

| Package | Description |
|---------|-------------|
| **dash** | Merchant dashboard application |
| **dropin-service** | Payment drop-in widget (v4/v5) |
| **var-service** | VAR service application |
| **session-recorder** | Session recording library |
| **dash-do** | Durable Objects for dash |
| **eslint-config** | Shared ESLint/Prettier config |

## Quick Start

```bash
npm install
npm run dev --workspace dash
```

## Commands

```bash
npm run dev --workspace <package>     # Start dev server
npm run build --workspace <package>   # Build package
npm run storybook --workspace dash    # Run Storybook
npm test                              # Run all tests
npm run format-code                   # Lint and format
npm run deploy-dev                    # Deploy to dev
```

## Environments

Build/deploy commands support: `dev`, `ci`, `qa`, `uat`, `prod`

```bash
npm run build-prod --workspace dash
npm run deploy-prod --workspace dash
```
