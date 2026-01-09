<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantHeader from '$lib/components/merchant/merchant-header.svelte';
	import DestinationHeader from '$lib/components/destination/destination-header.svelte';
	import AccountSelector from '$lib/components/merchant/account-selector.svelte';

	const { Story } = defineMeta({
		title: 'Flows/Auth/Dashboard Access',
		component: AccountSelector,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	import {
		mockExistingUser,
		singleMerchantAccess,
		multipleMerchantAccess,
		singleDestinationAccess,
		multipleDestinationAccess,
		mixedAccessMerchants,
		mixedAccessDestinations,
		mockPendingInvites
	} from './_mock-auth-data.js';
</script>

<Story name="Single Merchant">
	{#snippet template()}
		<MerchantHeader
			user={mockExistingUser}
			domain="acme.com"
			merchantAccess={singleMerchantAccess}
			destinationAccess={[]}
			currentPath="/merchant/acme.com"
			userRole="owner"
			pendingInvites={[]}
		/>
	{/snippet}
</Story>

<Story name="Multiple Merchants">
	{#snippet template()}
		<MerchantHeader
			user={mockExistingUser}
			domain="acme.com"
			merchantAccess={multipleMerchantAccess}
			destinationAccess={[]}
			currentPath="/merchant/acme.com"
			userRole="owner"
			pendingInvites={[]}
		/>
	{/snippet}
</Story>

<Story name="Single Destination">
	{#snippet template()}
		<DestinationHeader
			user={mockExistingUser}
			appId="chatgpt"
			destinationName="ChatGPT"
			destinationAccess={singleDestinationAccess}
			merchantAccess={[]}
			currentPath="/destination/chatgpt"
			userRole="owner"
			pendingInvites={[]}
		/>
	{/snippet}
</Story>

<Story name="Multiple Destinations">
	{#snippet template()}
		<DestinationHeader
			user={mockExistingUser}
			appId="chatgpt"
			destinationName="ChatGPT"
			destinationAccess={multipleDestinationAccess}
			merchantAccess={[]}
			currentPath="/destination/chatgpt"
			userRole="owner"
			pendingInvites={[]}
		/>
	{/snippet}
</Story>

<Story name="Mixed Access (Merchant View)">
	{#snippet template()}
		<MerchantHeader
			user={mockExistingUser}
			domain="acme.com"
			merchantAccess={mixedAccessMerchants}
			destinationAccess={mixedAccessDestinations}
			currentPath="/merchant/acme.com"
			userRole="owner"
			pendingInvites={[]}
		/>
	{/snippet}
</Story>

<Story name="Mixed Access (Destination View)">
	{#snippet template()}
		<DestinationHeader
			user={mockExistingUser}
			appId="chatgpt"
			destinationName="ChatGPT"
			destinationAccess={mixedAccessDestinations}
			merchantAccess={mixedAccessMerchants}
			currentPath="/destination/chatgpt"
			userRole="owner"
			pendingInvites={[]}
		/>
	{/snippet}
</Story>

<Story name="With Pending Invites">
	{#snippet template()}
		<MerchantHeader
			user={mockExistingUser}
			domain="acme.com"
			merchantAccess={singleMerchantAccess}
			destinationAccess={[]}
			currentPath="/merchant/acme.com"
			userRole="owner"
			pendingInvites={mockPendingInvites}
		/>
	{/snippet}
</Story>

<Story name="No Dashboard Access">
	{#snippet template()}
		<div class="min-h-screen bg-background flex items-center justify-center">
			<div class="max-w-md mx-auto text-center p-8">
				<h3 class="text-lg font-semibold mb-2">No Dashboard Access</h3>
				<p class="text-muted-foreground mb-4">
					You don't have access to any dashboards yet. Accept a pending invite or sign up
					as a new merchant.
				</p>
				<div class="flex gap-4 justify-center">
					<button
						class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
					>
						Sign Up as Merchant
					</button>
					<button class="px-4 py-2 border border-border rounded-lg text-sm font-medium">
						View Invites
					</button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
