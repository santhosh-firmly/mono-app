<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Avatar from './avatar.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Avatar',
		component: Avatar,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<Avatar {...args} />
{/snippet}

<Story name="Single Name" args={{ name: 'John' }} {template} />

<Story name="Full Name" args={{ name: 'John Doe' }} {template} />

<Story name="Long Name" args={{ name: 'Alexander Christopher' }} {template} />

<Story name="Empty Name" args={{ name: '' }} {template} />
