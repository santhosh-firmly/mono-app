<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Example from './example.svelte';

	const { Story } = defineMeta({
		title: 'Views/Example',
		component: Example,
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			recording: { control: 'boolean' }
		}
	});
</script>

<Story name="Not Recording" args={{ recording: false, onToggleRecording: () => {} }}>
	{#snippet template(args)}
		<Example {...args} />
	{/snippet}
</Story>

<Story name="Recording" args={{ recording: true, onToggleRecording: () => {} }}>
	{#snippet template(args)}
		<Example {...args} />
	{/snippet}
</Story>
