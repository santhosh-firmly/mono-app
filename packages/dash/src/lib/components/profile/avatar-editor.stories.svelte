<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AvatarEditor from './avatar-editor.svelte';

	const { Story } = defineMeta({
		title: 'Profile/Avatar Editor',
		component: AvatarEditor,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' }
		}
	});
</script>

{#snippet template(args)}
	<AvatarEditor {...args} />
{/snippet}

<Story
	name="Closed"
	args={{
		open: false
	}}
	{template}
/>

<Story
	name="Open"
	args={{
		open: true,
		onSave: async (blob) => {
			console.log('Saving avatar blob:', blob);
			alert('Avatar saved! (simulated)');
		}
	}}
	{template}
/>
