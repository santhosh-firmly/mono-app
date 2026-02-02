<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MerchantNavbar from '$lib/components/merchant/merchant-navbar.svelte';
	import MerchantHeader from '$lib/components/merchant/merchant-header.svelte';
	import IntegrationProgress from '$lib/components/merchant/integration-progress.svelte';
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
	<MerchantHeader
		user={data.user}
		domain={data.domain}
		merchantAccess={data.merchantAccess}
		destinationAccess={data.destinationAccess}
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
		<MerchantNavbar
			{currentPath}
			domain={data.domain}
			userRole={data.userRole}
			isFirmlyAdmin={data.isFirmlyAdmin}
		/>

		<!-- Main Content Area -->
		<div class="flex flex-1 flex-col">
			<!-- Content + Right Sidebar -->
			<div class="flex flex-1">
				<!-- Main Content -->
				<main class="flex-1 p-4 lg:p-6">
					<ContentContainer>
						{@render children()}
					</ContentContainer>
				</main>

				<!-- Right Sidebar - Only during onboarding and integration not complete -->
				{#if data.isOnboarding && data.onboardingProgress?.integration !== 'completed'}
					<aside
						class="hidden w-80 flex-shrink-0 border-l border-border bg-card p-4 xl:block"
					>
						<IntegrationProgress
							domain={data.domain}
							isFirmlyAdmin={data.isFirmlyAdmin}
						/>
					</aside>
				{/if}
			</div>
		</div>
	</div>
</div>
