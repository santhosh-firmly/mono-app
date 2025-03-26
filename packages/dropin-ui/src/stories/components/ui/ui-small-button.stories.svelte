<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiSmallButton from '$lib/components/ui/ui-small-button.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/SmallButton',
		component: UiSmallButton,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onclick: fn(),
			children: 'Button Text'
		}
	});
</script>

{#snippet template(args)}
	<div class="p-4">
		<UiSmallButton onclick={args.onclick}>
			{args.children}
		</UiSmallButton>
	</div>
{/snippet}

<Story name="Default" children={template} />

<Story
	name="Short Text"
	children={template}
	args={{
		children: 'OK'
	}}
/>

<Story
	name="Longer Text"
	children={template}
	args={{
		children: 'Apply Discount'
	}}
/>

<Story
	name="With Icon"
	children={template}
	args={{
		children: '+ Add Item'
	}}
/>
