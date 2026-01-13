# Components Overview

The Firmly Dashboard uses a modular component architecture built on Svelte 5, Bits UI, and Tailwind CSS.

## Statistics

| Metric | Count |
|--------|-------|
| Total components | ~190 |
| Storybook stories | ~77 |
| UI component categories | 29 |
| Feature component groups | 10+ |

## Component Organization

```
src/lib/components/
├── ui/                     # Shared UI primitives (Bits UI based)
│   ├── button/
│   ├── card/
│   ├── dialog/
│   └── ... (26 more)
│
├── custom/                 # Reusable custom components
│   ├── data-table/
│   ├── combobox.svelte
│   └── ...
│
├── app/                    # App layout components
│   ├── navbar.svelte
│   └── page-header.svelte
│
├── auth/                   # Authentication components
├── merchant/               # Merchant dashboard components
├── merchant-settings/      # Settings page components
├── order/                  # Order display components
├── team/                   # Team management components
├── profile/                # User profile components
├── charts/                 # Data visualization
├── dashboard-blocks/       # Dashboard widgets
└── admin/                  # Admin-specific components
```

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Svelte 5** | Component framework with runes |
| **Bits UI** | Headless accessible components |
| **Tailwind CSS v3** | Utility-first styling |
| **tailwind-variants** | Variant management |
| **lucide-svelte** | Icon library |
| **chart.js** | Data visualization |
| **svelte-headless-table** | Advanced tables |

## Component Patterns

### Compound Components

Many UI components use the compound component pattern with named exports (e.g., `Card.Root`, `Card.Header`, `Card.Content`).

### Svelte 5 Runes

Components use Svelte 5's runes for reactivity:
- `$props()` - Component props with defaults
- `$state()` - Reactive state
- `$derived()` - Computed values
- `$effect()` - Side effects
- `$bindable()` - Two-way binding

## Component Categories

### 1. UI Library (`ui/`)

Foundational UI primitives built on Bits UI. See [UI Library](./ui-library.md).

### 2. Feature Components

Domain-specific components organized by feature. See [Feature Components](./feature-components.md).

### 3. Custom Components (`custom/`)

Reusable components not tied to specific features:
- `data-table/` - Advanced table with sorting, filtering, pagination
- `combobox.svelte` - Search-and-select dropdown
- `copy-to-clipboard.svelte` - Click-to-copy utility
- `form-field.svelte` - Form field wrapper

### 4. Charts (`charts/`)

Data visualization using Chart.js:
- `area-chart.svelte`
- `bar-chart.svelte`
- `pie-chart.svelte`

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Component | lowercase-with-hyphens | `login-card.svelte` |
| Story | same name + `.stories` | `login-card.stories.svelte` |
| Index | barrel export | `index.js` |

## Storybook

Components have corresponding Storybook stories using Svelte CSF. Stories use `@storybook/addon-svelte-csf` with `defineMeta` and template snippets.

## Styling Approach

### Tailwind Utility Classes

Components use Tailwind utility classes for styling with consistent spacing, colors, and typography.

### CSS Variables

Theme colors use CSS variables for consistent theming across light/dark modes.

### Class Merging

The `cn()` utility function merges Tailwind classes conditionally.

## Icon Usage

Icons are imported from `lucide-svelte` and sized with Tailwind utility classes.

## Import Conventions

### Barrel Exports

Feature folders have `index.js` for clean imports, allowing imports like `import { LoginCard } from '$lib/components/auth'`.

### Path Aliases

Standard SvelteKit aliases are used:
- `$lib` - src/lib
- `$lib/components` - Component library
- `$lib/server` - Server-side utilities

## Related Documentation

- [UI Library](./ui-library.md) - UI primitives
- [Feature Components](./feature-components.md) - Domain components
