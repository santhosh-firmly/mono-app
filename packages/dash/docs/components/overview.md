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

Many UI components use the compound component pattern:

```svelte
<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

### Svelte 5 Runes

Components use Svelte 5's runes for reactivity:

```svelte
<script>
  // Props with defaults
  let { variant = 'default', size = 'md' } = $props();

  // Reactive state
  let count = $state(0);

  // Derived values
  let doubled = $derived(count * 2);

  // Side effects
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### Two-way Binding

Use `$bindable` for two-way binding:

```svelte
<script>
  let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

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

Components have corresponding Storybook stories using Svelte CSF:

```svelte
<!-- login-card.stories.svelte -->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LoginCard from './login-card.svelte';

  const { Story } = defineMeta({
    title: 'Auth/LoginCard',
    component: LoginCard,
    tags: ['autodocs']
  });
</script>

{#snippet template(args)}
  <LoginCard {...args} />
{/snippet}

<Story name="Default" {template} />
```

Run Storybook:
```bash
npm run storybook --workspace dash
```

## Styling Approach

### Tailwind Utility Classes

```svelte
<div class="flex items-center gap-4 p-4 rounded-lg bg-card">
  <span class="text-sm font-medium text-muted-foreground">
    Label
  </span>
</div>
```

### CSS Variables

Theme colors use CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --primary: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
}
```

### Class Merging

Use `cn()` utility for conditional classes:

```javascript
import { cn } from '$lib/utils.js';

<button class={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-primary text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

## Icon Usage

Icons from lucide-svelte:

```svelte
<script>
  import House from 'lucide-svelte/icons/house';
  import Settings from 'lucide-svelte/icons/settings';
</script>

<House class="h-4 w-4" />
<Settings class="h-4 w-4 text-muted-foreground" />
```

## Import Conventions

### Barrel Exports

Feature folders have `index.js` for clean imports:

```javascript
// components/auth/index.js
export { default as LoginCard } from './login-card.svelte';
export { default as OTPInput } from './otp-input.svelte';

// Usage
import { LoginCard, OTPInput } from '$lib/components/auth';
```

### Path Aliases

```javascript
import Button from '$lib/components/ui/button/button.svelte';
import { getMerchantTeam } from '$lib/server/merchant.js';
```

## Related Documentation

- [UI Library](./ui-library.md) - UI primitives
- [Feature Components](./feature-components.md) - Domain components
- [Patterns](./patterns.md) - Design patterns
