<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationUserMenu from './destination-user-menu.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Navigation/User Menu',
		component: DestinationUserMenu,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script>
	const mockUser = {
		id: 'user-123',
		name: 'John Doe',
		email: 'john@example.com',
		hasAvatar: false
	};

	const mockUserWithAvatar = {
		id: 'user-456',
		name: 'Jane Smith',
		email: 'jane@company.com',
		hasAvatar: true
	};

	const mockUserLongName = {
		id: 'user-789',
		name: 'Alexandra Elizabeth Montgomery',
		email: 'alexandra.montgomery@verylongcompanyname.com',
		hasAvatar: false
	};
</script>

{#snippet template(args)}
	<DestinationUserMenu user={args.user} />
{/snippet}

<Story
	name="Default"
	args={{
		user: mockUser
	}}
	{template}
/>

<Story
	name="With Avatar"
	args={{
		user: mockUserWithAvatar
	}}
	{template}
/>

<Story
	name="Long Name"
	args={{
		user: mockUserLongName
	}}
	{template}
/>

<Story
	name="No Name"
	args={{
		user: {
			id: 'user-000',
			name: '',
			email: 'anonymous@example.com',
			hasAvatar: false
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
			email: 'admin@company.com',
			hasAvatar: false
		}
	}}
	{template}
/>
