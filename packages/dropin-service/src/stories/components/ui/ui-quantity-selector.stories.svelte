<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiQuantitySelector from '$lib/components/ui/ui-quantity-selector.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/QuantitySelector',
		component: UiQuantitySelector,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			quantity: 1,
			onChange: fn(),
			disabled: false,
			delay: 300
		}
	});
</script>

{#snippet template(args)}
	<div class="p-4">
		<UiQuantitySelector
			quantity={args.quantity}
			onChange={args.onChange}
			disabled={args.disabled}
			delay={args.delay}
		/>
	</div>
{/snippet}

<Story name="Default" children={template} />

<Story
	name="Disabled"
	children={template}
	args={{
		disabled: true
	}}
/>

<Story
	name="No Delay"
	children={template}
	args={{
		delay: 0
	}}
/>
