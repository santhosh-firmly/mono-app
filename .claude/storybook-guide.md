# Storybook Stories Guide for Svelte 5

This guide provides instructions for creating Storybook stories with interaction tests for UI components in the dropin-service package.

## Prerequisites

- Storybook 8.x with `@storybook/addon-svelte-csf`
- Svelte 5 with runes support
- `@storybook/test` for interaction testing

## Story File Structure

### Basic Template

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn, within, userEvent, expect } from '@storybook/test';

	import ComponentName from '$lib/components/ui/component-name.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/ComponentName',
		component: ComponentName,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered' // or 'fullscreen' for larger components
		},
		args: {
			// Default args that apply to all stories
			onclick: fn(), // Use fn() for event handlers
			// other default props
		},
		argTypes: {
			// Define controls for Storybook UI
			propName: {
				control: 'text', // text, boolean, color, number, etc.
				description: 'Description of the prop'
			}
		}
	});
</script>

<!-- Stories go here -->
```

## Key Patterns

### Pattern 1: Component with Args (Automatic Rendering)

When `component` is defined in meta, the component renders automatically with args passed as props.

```svelte
<Story
	name="Story Name"
	args={{
		prop1: 'value1',
		prop2: true
	}}
>
	Children content here
</Story>
```

**How it works:**
- Component from meta is rendered automatically
- Args are passed as props
- Content inside `<Story>` tags becomes the component's children slot

### Pattern 2: With Interaction Tests

Add a `play` function to test user interactions:

```svelte
<Story
	name="Story Name"
	args={{
		onclick: fn()
	}}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		
		// Find elements
		const button = canvas.getByRole('button', { name: 'Button Text' });
		
		// Assertions
		await expect(button).toBeInTheDocument();
		await expect(button).toBeEnabled();
		
		// User interactions
		await userEvent.click(button);
		
		// Verify event handlers
		await expect(args.onclick).toHaveBeenCalledTimes(1);
	}}
>
	Button Text
</Story>
```

### Pattern 3: Using Template Snippets (Advanced)

For complex rendering logic that needs to respond to args changes:

```svelte
{#snippet template(args)}
	<Component {...args}>
		{#if args.condition}
			<ChildA />
		{:else}
			<ChildB />
		{/if}
	</Component>
{/snippet}

<Story name="Story Name" args={{ condition: true }} {template} />
```

### Pattern 4: Static Composition (asChild)

When you need full control and don't need args reactivity:

```svelte
<Story name="Story Name" asChild>
	<Component prop="static">
		<StaticChild />
	</Component>
</Story>
```

**Warning:** `asChild` completely ignores args, so Controls won't work.

## Best Practices

### 1. Create Only Essential Stories

Focus on real-world use cases that reflect how the component will actually be used:

- **Default state** - The most common usage
- **Prop variations** - Each significant prop value (e.g., custom color, disabled state)
- **Interactive states** - States that result from user interaction

**Avoid:**
- Creating stories for every possible prop combination
- Stories that don't reflect real usage
- Duplicate test scenarios

### 2. Name Stories Clearly

Use descriptive names that indicate the scenario:

```svelte
<Story name="Default" />          // Good
<Story name="Custom Color" />     // Good
<Story name="Disabled" />         // Good
<Story name="Test 1" />           // Bad
<Story name="Variation" />        // Bad - not specific
```

### 3. Interaction Test Guidelines

**What to test:**
- User interactions (click, type, hover)
- Event handler calls
- Accessibility (ARIA attributes, keyboard navigation)
- Conditional rendering
- State changes

**What NOT to test:**
- CSS styling details (unless critical to functionality)
- Internal implementation details
- Framework behavior

**Common assertions:**
```javascript
// Element queries
const button = canvas.getByRole('button', { name: 'Text' });
const input = canvas.getByLabelText('Email');
const text = canvas.getByText('Content');

// Visibility
await expect(element).toBeInTheDocument();
await expect(element).toBeVisible();

// State
await expect(button).toBeEnabled();
await expect(button).toBeDisabled();
await expect(input).toHaveValue('value');
await expect(element).toHaveFocus();

// Attributes
await expect(element).toHaveAttribute('data-testid', 'value');
await expect(element).toHaveAccessibleName('Name');

// Classes and styles
await expect(element).toHaveClass('class-name');
await expect(element).toHaveStyle({ 'property': 'value' });

// Events
await expect(args.onclick).toHaveBeenCalled();
await expect(args.onclick).toHaveBeenCalledTimes(3);
await expect(args.onclick).toHaveBeenCalledWith('argument');
```

### 4. Event Handlers

Always use `fn()` from `@storybook/test` for event handlers in args:

```svelte
args: {
	onclick: fn(),
	onchange: fn(),
	onsubmit: fn()
}
```

This allows tracking calls in interaction tests and shows events in the Actions panel.

### 5. Default Args in Meta

Put common args in the meta's `args` object to avoid repetition:

```svelte
const { Story } = defineMeta({
	// ...
	args: {
		onclick: fn(), // Applied to all stories
		disabled: false
	}
});

// Then override per story
<Story name="Disabled" args={{ disabled: true }} />
```

## UI Component Story Checklist

For each UI component, create stories for:

1. **Default state** - With interaction test for primary functionality
2. **Each significant prop** - One story per important prop variation
3. **Disabled/loading states** - If applicable
4. **Error states** - If applicable

## Example: Complete Button Story

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn, within, userEvent, expect } from '@storybook/test';

	import UiButton from '$lib/components/ui/ui-button.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Button',
		component: UiButton,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onclick: fn()
		},
		argTypes: {
			color: {
				control: 'color',
				description: 'Custom primary color value (CSS color)'
			},
			disabled: {
				control: 'boolean',
				description: 'Disabled state of the button'
			}
		}
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole('button');

		await expect(button).toBeInTheDocument();
		await expect(button).toBeEnabled();

		await userEvent.click(button);
		await expect(args.onclick).toHaveBeenCalledTimes(1);
	}}
>
	Button Text
</Story>

<Story
	name="Custom Color"
	args={{ color: '#22C55E' }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole('button');

		await expect(button).toHaveStyle({ '--color-primary': '#22C55E' });
	}}
>
	Green Button
</Story>

<Story
	name="Disabled"
	args={{ disabled: true }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole('button');

		await expect(button).toBeDisabled();
		await userEvent.click(button);
		await expect(args.onclick).not.toHaveBeenCalled();
	}}
>
	Disabled Button
</Story>
```

## Running Stories

### Development
```bash
npm run storybook --workspace dropin-service
```

### Test Runner
```bash
npm run test-storybook --workspace dropin-service
```

## Common Pitfalls to Avoid

1. **Don't use `children={template}` with automatic rendering** - If component is in meta, just put children directly in Story tags
2. **Don't use `{...args}` when spreading props** - Args are automatically passed
3. **Don't mix `asChild` with `args`** - asChild ignores args completely
4. **Don't create separate `fn()` instances** - Reuse from args to track calls correctly
5. **Don't forget `await` in play functions** - All interactions and assertions should be awaited

## References

- [Storybook Svelte CSF Addon](https://storybook.js.org/addons/@storybook/addon-svelte-csf)
- [Storybook Testing Library](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
