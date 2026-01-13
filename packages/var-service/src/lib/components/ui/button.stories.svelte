<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './button.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Button',
		component: Button,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<Button {...args}>
		{args.label}
	</Button>
{/snippet}

<Story name="Default" args={{ label: 'Click me' }} {template} />

<Story name="Ghost" args={{ variant: 'ghost', label: 'Ghost Button' }} {template} />

<Story name="Link" args={{ variant: 'link', label: 'Link Button' }} {template} />

<Story name="Disabled">
	{#snippet template(args)}
		<Button {...args} disabled>Disabled Button</Button>
	{/snippet}
</Story>
