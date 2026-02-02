<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import DestinationNavbar from '$lib/components/destination/destination-navbar.svelte';
	import DestinationHeader from '$lib/components/destination/destination-header.svelte';
	import FirmlyAdminBanner from '$lib/components/merchant/firmly-admin-banner.svelte';
	import ContentContainer from '$lib/components/ui/content-container.svelte';
	import { adminMode } from '$lib/stores/admin-mode.svelte.js';

	let { data, children } = $props();

	let currentPath = $derived($page.url.pathname);

	// Initialize admin mode from URL param on page load
	onMount(() => {
		adminMode.initializeFromUrl();
	});
</script>

<div class="flex min-h-screen flex-col bg-background">
	<!-- Firmly Admin Banner - shown when admin is viewing -->
	{#if data.isFirmlyAdmin}
		<FirmlyAdminBanner />
	{/if}

	<!-- Header - Full width at top -->
	<DestinationHeader
		user={data.user}
		appId={data.appId}
		destinationName={data.destinationName}
		destinationAccess={data.destinationAccess}
		merchantAccess={data.merchantAccess}
		userRole={data.userRole}
		pendingInvites={data.pendingInvites}
		isFirmlyAdmin={data.isFirmlyAdmin}
		hasAzureADAuth={data.hasAzureADAuth}
		env={data.firmlyEnv}
		{currentPath}
	/>

	<!-- Content area below header -->
	<div class="flex flex-1">
		<!-- Left Sidebar Navigation -->
		<DestinationNavbar
			{currentPath}
			appId={data.appId}
			userRole={data.userRole}
			isFirmlyAdmin={data.isFirmlyAdmin}
		/>

		<!-- Main Content Area -->
		<div class="flex flex-1 flex-col">
			<!-- Content -->
			<div class="flex flex-1">
				<!-- Main Content -->
				<main class="flex-1 p-4 lg:p-6">
					<ContentContainer>
						{@render children()}
					</ContentContainer>
				</main>
			</div>
		</div>
	</div>
</div>
