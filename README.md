# Firmly Frontend Monorepo

Welcome to the Firmly Frontend Monorepo! This repository contains all the frontend applications and shared packages used across the Firmly ecosystem.

## 📦 What's Inside

This monorepo is organized into multiple packages using Lerna for managing cross-package dependencies and versioning:

- **dropin-service** - Svelte-based frontend application for the drop-in payment service
- **eslint-config** - Shared ESLint and Prettier configuration used across all packages

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
# Install dependencies
npm install
```

## 🛠️ Development

### Working with packages

```bash
# Start development server for a specific package
npm run dev --workspace dropin-service

# Build a specific package
npm run build --workspace dropin-service
```

### Code Quality

This repository uses a shared ESLint and Prettier configuration to ensure code consistency across all packages:

```bash
# Lint and format all packages
npm run format-code
```

## 🧪 Testing

```bash
# Run tests across all packages
npm test

# Run tests for a specific package
npm test --workspace dropin-service
```

## 📝 Committing Changes

We use Husky for pre-commit hooks to ensure code quality before committing:

1. Write your code
2. Stage your changes
3. Commit (the pre-commit hook will run automatically)

## 📚 Documentation

Each package contains its own README with package-specific documentation:

- [dropin-service](./packages/dropin-service/README.md)
- [eslint-config](./packages/eslint-config/README.md)

## 📋 CI/CD

This repository uses GitHub Actions for continuous integration:

- **ci-mono.yml** - Runs tests and linting across all packages
- **ci-service-delivery.yml** - Handles deployment for the dropin-service
- **update-version.yml** - Manages version updates
