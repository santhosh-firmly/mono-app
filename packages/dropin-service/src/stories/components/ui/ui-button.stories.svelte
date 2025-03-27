<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiButton from '$lib/components/ui/ui-button.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Button',
		component: UiButton,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			children: 'Button Text',
			onclick: fn(),
			color: '',
			class: ''
		}
	});
</script>

<Story name="Primary">
	{#snippet children(args)}
		<UiButton {...args}>Button Text</UiButton>
	{/snippet}
</Story>

<Story name="Custom Color">
	{#snippet children(args)}
		<UiButton {...args} color="#22C55E">Button Text</UiButton>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet children(args)}
		<UiButton {...args} disabled>Button Text</UiButton>
	{/snippet}
</Story>

<Story name="With Custom Class">
	{#snippet children(args)}
		<UiButton {...args} class="text-lg font-bold">Button Text</UiButton>
	{/snippet}
</Story>
