<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UserNav from './user-nav.svelte';

	const { Story } = defineMeta({
		title: 'App/User Nav',
		component: UserNav,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<UserNav {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		user: {
			id: 'user-123',
			name: 'John Doe',
			email: 'john@example.com',
			hasAvatar: false
		}
	}}
	{template}
/>

<Story
	name="With Avatar"
	args={{
		user: {
			id: 'user-456',
			name: 'Jane Smith',
			email: 'jane@company.com',
			hasAvatar: true
		}
	}}
	{template}
/>

<Story
	name="Long Email"
	args={{
		user: {
			id: 'user-789',
			name: 'Christopher',
			email: 'christopher.alexander@verylongcompanyname.com',
			hasAvatar: false
		}
	}}
	{template}
/>

<Story
	name="Single Letter Name"
	args={{
		user: {
			id: 'user-000',
			name: 'A',
			email: 'a@example.com',
			hasAvatar: false
		}
	}}
	{template}
/>
