<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OnboardingTasks from '$lib/components/merchant/onboarding-tasks.svelte';
	import MerchantHeader from '$lib/components/merchant/merchant-header.svelte';
	import MerchantNavbar from '$lib/components/merchant/merchant-navbar.svelte';

	const { Story } = defineMeta({
		title: 'Flows/Merchant Onboarding/Full Dashboard',
		component: OnboardingTasks,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	import {
		mockUser,
		mockMerchantAccess,
		mockDestinationAccess,
		domain,
		currentPath,
		onboardingStatuses,
		kybStatusRejected,
		kybStatusDefault,
		goLiveStatusRejected,
		goLiveStatusDefault
	} from './_mock-flow-data.js';
</script>

{#snippet fullDashboardTemplate(args)}
	<div class="min-h-screen bg-background">
		<MerchantHeader
			user={mockUser}
			{domain}
			merchantAccess={mockMerchantAccess}
			destinationAccess={mockDestinationAccess}
			{currentPath}
			userRole="owner"
			pendingInvites={[]}
		/>
		<div class="flex">
			<MerchantNavbar {currentPath} {domain} userRole="owner" isFirmlyAdmin={false} />
			<main class="flex-1 p-6">
				<div class="max-w-4xl mx-auto">
					<div class="mb-6">
						<h1 class="text-2xl font-bold text-foreground">Welcome to Firmly</h1>
						<p class="text-muted-foreground">
							Complete these tasks to start selling on AI destinations
						</p>
					</div>
					<OnboardingTasks
						{domain}
						initialStatuses={args.statuses}
						kybStatus={args.kybStatus}
						goLiveStatus={args.goLiveStatus}
					/>
				</div>
			</main>
		</div>
	</div>
{/snippet}

<Story
	name="New Merchant (Integration In Progress)"
	args={{
		statuses: onboardingStatuses.start,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="Ready for Agreement"
	args={{
		statuses: onboardingStatuses.integrationComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="KYB Submitted (Pending)"
	args={{
		statuses: onboardingStatuses.kybPending,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="KYB Rejected"
	args={{
		statuses: onboardingStatuses.kybRejected,
		kybStatus: kybStatusRejected,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="KYB Approved (Tasks Unlocked)"
	args={{
		statuses: onboardingStatuses.kybApproved,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="Midway Progress"
	args={{
		statuses: onboardingStatuses.destinationsComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="Almost Done (CDN Complete)"
	args={{
		statuses: onboardingStatuses.cdnComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="Go Live Pending"
	args={{
		statuses: onboardingStatuses.goLivePending,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="Go Live Rejected"
	args={{
		statuses: onboardingStatuses.goLiveRejected,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusRejected
	}}
	template={fullDashboardTemplate}
/>

<Story
	name="All Complete!"
	args={{
		statuses: onboardingStatuses.allComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={fullDashboardTemplate}
/>
