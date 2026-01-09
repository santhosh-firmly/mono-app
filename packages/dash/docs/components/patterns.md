# Component Patterns

Design patterns and conventions used throughout the component library.

## Svelte 5 Runes

### Props with $props()

```svelte
<script>
  // Basic props with defaults
  let {
    variant = 'default',
    size = 'md',
    disabled = false
  } = $props();

  // Required props (no default)
  let { data } = $props();

  // Rest props for forwarding
  let { class: className, ...restProps } = $props();
</script>
```

### Reactive State with $state()

```svelte
<script>
  // Simple state
  let count = $state(0);

  // Object state
  let form = $state({
    email: '',
    password: ''
  });

  // Array state
  let items = $state([]);
</script>
```

### Derived Values with $derived()

```svelte
<script>
  let items = $state([]);

  // Computed value that auto-updates
  let total = $derived(items.reduce((sum, item) => sum + item.price, 0));

  // Complex derivations
  let filteredItems = $derived(
    items.filter(item => item.active)
  );
</script>
```

### Side Effects with $effect()

```svelte
<script>
  let searchTerm = $state('');

  // Runs when searchTerm changes
  $effect(() => {
    if (searchTerm.length > 2) {
      fetchResults(searchTerm);
    }
  });

  // Cleanup with return
  $effect(() => {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });
</script>
```

### Two-way Binding with $bindable()

```svelte
<!-- Parent -->
<script>
  let email = $state('');
</script>

<EmailInput bind:value={email} />

<!-- Child (EmailInput.svelte) -->
<script>
  let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

## Event Handling

### Callback Props

```svelte
<script>
  let {
    onclick,
    onsubmit,
    onchange
  } = $props();
</script>

<button onclick={onclick}>Click</button>

<form onsubmit={(e) => {
  e.preventDefault();
  onsubmit(formData);
}}>
```

### Custom Events

```svelte
<script>
  let { onselect, ondelete } = $props();

  function handleSelect(item) {
    onselect?.(item);
  }
</script>

<button onclick={() => handleSelect(item)}>
  Select
</button>
```

## Compound Components

### Pattern

Export multiple components that work together:

```javascript
// components/ui/card/index.js
export { default as Root } from './card.svelte';
export { default as Header } from './card-header.svelte';
export { default as Title } from './card-title.svelte';
export { default as Description } from './card-description.svelte';
export { default as Content } from './card-content.svelte';
export { default as Footer } from './card-footer.svelte';
```

### Usage

```svelte
<script>
  import * as Card from '$lib/components/ui/card';
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Root>
```

## Styling Patterns

### Class Merging with cn()

```javascript
// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

```svelte
<script>
  import { cn } from '$lib/utils.js';
  let { class: className } = $props();
</script>

<div class={cn(
  'base-styles',
  condition && 'conditional-styles',
  className
)}>
```

### Variant Management with tailwind-variants

```javascript
import { tv } from 'tailwind-variants';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input bg-background'
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});
```

```svelte
<script>
  import { buttonVariants } from './button.js';

  let { variant, size, class: className } = $props();
</script>

<button class={cn(buttonVariants({ variant, size }), className)}>
  <slot />
</button>
```

## Snippet Templates

### Defining Snippets

```svelte
{#snippet icon()}
  <svg>...</svg>
{/snippet}

{#snippet content(item)}
  <span>{item.name}</span>
{/snippet}
```

### Using Snippets

```svelte
<Button>
  {@render icon()}
  Click me
</Button>

{#each items as item}
  {@render content(item)}
{/each}
```

### Snippets as Props

```svelte
<!-- Parent -->
{#snippet customHeader(title)}
  <h2 class="custom">{title}</h2>
{/snippet}

<Card header={customHeader} />

<!-- Child -->
<script>
  let { header } = $props();
</script>

{@render header?.('Title') ?? <DefaultHeader />}
```

## Loading States

### Simple Loading

```svelte
<script>
  let loading = $state(true);
  let data = $state(null);

  onMount(async () => {
    data = await fetchData();
    loading = false;
  });
</script>

{#if loading}
  <Spinner />
{:else}
  <DataDisplay {data} />
{/if}
```

### Skeleton Loading

```svelte
{#if loading}
  <div class="animate-pulse">
    <div class="h-4 bg-muted rounded w-3/4" />
    <div class="h-4 bg-muted rounded w-1/2 mt-2" />
  </div>
{:else}
  <Content {data} />
{/if}
```

## Form Patterns

### Controlled Inputs

```svelte
<script>
  let email = $state('');
  let password = $state('');
  let errors = $state({});

  function validate() {
    errors = {};
    if (!email) errors.email = 'Required';
    if (!password) errors.password = 'Required';
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    await submitForm({ email, password });
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); submit(); }}>
  <Input
    bind:value={email}
    error={errors.email}
  />
  <Input
    type="password"
    bind:value={password}
    error={errors.password}
  />
  <Button type="submit">Submit</Button>
</form>
```

### Form Field Wrapper

```svelte
<!-- FormField.svelte -->
<script>
  let { label, error, required, children } = $props();
</script>

<div class="space-y-2">
  <Label>
    {label}
    {#if required}<span class="text-destructive">*</span>{/if}
  </Label>
  {@render children()}
  {#if error}
    <p class="text-sm text-destructive">{error}</p>
  {/if}
</div>
```

## Async Patterns

### Data Fetching

```svelte
<script>
  import { onMount } from 'svelte';

  let data = $state(null);
  let error = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      data = await response.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>
```

### Optimistic Updates

```svelte
<script>
  let items = $state([]);

  async function deleteItem(id) {
    // Optimistically remove
    const removedItem = items.find(i => i.id === id);
    items = items.filter(i => i.id !== id);

    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
    } catch {
      // Restore on error
      items = [...items, removedItem];
    }
  }
</script>
```

## Storybook Patterns

### Basic Story

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './button.svelte';

  const { Story } = defineMeta({
    title: 'UI/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: 'select',
        options: ['default', 'destructive', 'outline']
      }
    }
  });
</script>

{#snippet template(args)}
  <Button {...args}>Click me</Button>
{/snippet}

<Story name="Default" {template} />
<Story name="Destructive" args={{ variant: 'destructive' }} {template} />
```

### Multiple Templates

```svelte
{#snippet default(args)}
  <Button {...args}>Default</Button>
{/snippet}

{#snippet withIcon(args)}
  <Button {...args}>
    <Icon class="mr-2 h-4 w-4" />
    With Icon
  </Button>
{/snippet}

<Story name="Default" template={default} />
<Story name="With Icon" template={withIcon} />
```

## Accessibility Patterns

### Focus Management

```svelte
<script>
  let inputRef;

  function focusInput() {
    inputRef?.focus();
  }
</script>

<input bind:this={inputRef} />
<button onclick={focusInput}>Focus</button>
```

### Keyboard Navigation

```svelte
<script>
  function handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPrevious();
        break;
      case 'Enter':
        selectCurrent();
        break;
    }
  }
</script>

<div role="listbox" onkeydown={handleKeydown}>
  {#each options as option}
    <div role="option" tabindex="0">
      {option.label}
    </div>
  {/each}
</div>
```

## Related Documentation

- [Components Overview](./overview.md) - Component architecture
- [UI Library](./ui-library.md) - UI primitives
- [Feature Components](./feature-components.md) - Domain components
