<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PendingInvitesPopover from './pending-invites-popover.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Team/Pending Invites Popover',
		component: PendingInvitesPopover,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<PendingInvitesPopover {...args} />
{/snippet}

<Story
	name="Single Invite"
	args={{
		pendingInvites: [
			{
				token: 'invite-1',
				merchant_domain: 'example-store.com',
				role: 'editor',
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				invited_by_email: 'admin@example-store.com'
			}
		]
	}}
	{template}
/>

<Story
	name="Multiple Invites"
	args={{
		pendingInvites: [
			{
				token: 'invite-1',
				merchant_domain: 'store-one.com',
				role: 'owner',
				expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
				invited_by_email: 'ceo@store-one.com'
			},
			{
				token: 'invite-2',
				merchant_domain: 'store-two.com',
				role: 'editor',
				expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
				invited_by_email: 'manager@store-two.com'
			},
			{
				token: 'invite-3',
				merchant_domain: 'store-three.com',
				role: 'viewer',
				expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
				isFirmlyAdmin: true
			}
		]
	}}
	{template}
/>

<Story
	name="Expiring Today"
	args={{
		pendingInvites: [
			{
				token: 'invite-urgent',
				merchant_domain: 'urgent-store.com',
				role: 'owner',
				expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
				invited_by_email: 'admin@urgent-store.com'
			}
		]
	}}
	{template}
/>

<Story
	name="From Firmly Admin"
	args={{
		pendingInvites: [
			{
				token: 'invite-firmly',
				merchant_domain: 'new-merchant.com',
				role: 'owner',
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				isFirmlyAdmin: true
			}
		]
	}}
	{template}
/>

<Story
	name="No Invites"
	args={{
		pendingInvites: []
	}}
	{template}
/>
