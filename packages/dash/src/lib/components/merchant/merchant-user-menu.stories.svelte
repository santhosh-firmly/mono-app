<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantUserMenu from './merchant-user-menu.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Navigation/User Menu',
		component: MerchantUserMenu,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<MerchantUserMenu {...args} />
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
	name="Long Name"
	args={{
		user: {
			id: 'user-789',
			name: 'Christopher Alexander Johnson III',
			email: 'christopher.alexander.johnson@verylongcompanyname.com',
			hasAvatar: false
		}
	}}
	{template}
/>

<Story
	name="Missing Name"
	args={{
		user: {
			id: 'user-000',
			email: 'anonymous@example.com',
			hasAvatar: false
		}
	}}
	{template}
/>
