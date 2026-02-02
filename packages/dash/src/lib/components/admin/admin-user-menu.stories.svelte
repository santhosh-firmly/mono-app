<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AdminUserMenu from './admin-user-menu.svelte';

	const { Story } = defineMeta({
		title: 'Admin/AdminUserMenu',
		component: AdminUserMenu,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			user: {
				control: 'object',
				description: 'User object with id, name, email, and hasAvatar properties'
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="p-4 bg-card border rounded-lg">
		<AdminUserMenu {...args} />
	</div>
{/snippet}

<Story
	name="With Avatar"
	args={{
		user: {
			id: 'user-123',
			name: 'John Doe',
			email: 'john.doe@firmly.com',
			hasAvatar: true
		}
	}}
	{template}
/>

<Story
	name="Without Avatar"
	args={{
		user: {
			id: 'user-456',
			name: 'Jane Smith',
			email: 'jane.smith@firmly.com',
			hasAvatar: false
		}
	}}
	{template}
/>

<Story
	name="Long Name"
	args={{
		user: {
			id: 'user-789',
			name: 'Alexander Christopher Wellington III',
			email: 'alexander.wellington@firmly.com',
			hasAvatar: true
		}
	}}
	{template}
/>

<Story
	name="Single Name"
	args={{
		user: {
			id: 'user-111',
			name: 'Admin',
			email: 'admin@firmly.com',
			hasAvatar: false
		}
	}}
	{template}
/>

<Story
	name="No User Data"
	args={{
		user: {}
	}}
	{template}
/>
