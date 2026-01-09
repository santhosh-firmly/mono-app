<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OnboardingTasks from '$lib/components/merchant/onboarding-tasks.svelte';
	import MerchantAgreement from '$lib/components/merchant/merchant-agreement.svelte';
	import DestinationsPage from '$lib/components/pages/merchant/destinations-page.svelte';

	const { Story } = defineMeta({
		title: 'Flows/Merchant Onboarding/Onboarding Journey',
		component: OnboardingTasks,
		parameters: {
			layout: 'padded'
		}
	});
</script>

<script>
	import {
		domain,
		onboardingStatuses,
		kybStatusRejected,
		kybStatusDefault,
		goLiveStatusRejected,
		goLiveStatusDefault,
		mockDestinations
	} from './_mock-flow-data.js';
</script>

{#snippet dashboardTemplate(args)}
	<div class="max-w-2xl mx-auto">
		<OnboardingTasks
			{domain}
			initialStatuses={args.statuses}
			kybStatus={args.kybStatus}
			goLiveStatus={args.goLiveStatus}
		/>
	</div>
{/snippet}

<Story
	name="New Merchant"
	args={{
		statuses: onboardingStatuses.start,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="Integration Complete"
	args={{
		statuses: onboardingStatuses.integrationComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

{#snippet agreementTemplate(args)}
	<div class="max-w-4xl mx-auto">
		<MerchantAgreement
			{domain}
			isSigned={args.isSigned}
			signedInfo={args.signedInfo}
			isSubmitting={false}
			onaccept={() => console.log('Agreement accepted')}
		/>
	</div>
{/snippet}

<Story
	name="Agreement Unsigned"
	args={{
		isSigned: false,
		signedInfo: null
	}}
	template={agreementTemplate}
/>

<Story
	name="Agreement Signed"
	args={{
		isSigned: true,
		signedInfo: {
			signed_by_email: 'john@acme.com',
			signed_at: new Date().toISOString(),
			client_location: 'San Francisco, CA'
		}
	}}
	template={agreementTemplate}
/>

<Story
	name="Agreement Complete"
	args={{
		statuses: onboardingStatuses.agreementComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="KYB Pending"
	args={{
		statuses: onboardingStatuses.kybPending,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="KYB Rejected"
	args={{
		statuses: onboardingStatuses.kybRejected,
		kybStatus: kybStatusRejected,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="KYB Approved"
	args={{
		statuses: onboardingStatuses.kybApproved,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

{#snippet destinationsTemplate(args)}
	<div class="max-w-4xl mx-auto">
		<DestinationsPage
			{domain}
			destinations={args.destinations}
			loading={false}
			saving={false}
			error=""
			successMessage=""
			hasExistingConfig={args.hasExistingConfig}
			hasChanges={args.hasChanges}
			onToggle={(id) => console.log('Toggle destination:', id)}
			onSave={() => console.log('Saving destinations')}
		/>
	</div>
{/snippet}

<Story
	name="Destinations Initial"
	args={{
		destinations: mockDestinations,
		hasExistingConfig: false,
		hasChanges: false
	}}
	template={destinationsTemplate}
/>

<Story
	name="Destinations Configured"
	args={{
		destinations: mockDestinations.map((d) => ({
			...d,
			isActive: ['chatgpt', 'claude', 'perplexity'].includes(d.id)
		})),
		hasExistingConfig: false,
		hasChanges: true
	}}
	template={destinationsTemplate}
/>

<Story
	name="Destinations Complete"
	args={{
		statuses: onboardingStatuses.destinationsComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="Catalog Complete"
	args={{
		statuses: onboardingStatuses.catalogComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="CDN Complete"
	args={{
		statuses: onboardingStatuses.cdnComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="Go Live Pending"
	args={{
		statuses: onboardingStatuses.goLivePending,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>

<Story
	name="Go Live Rejected"
	args={{
		statuses: onboardingStatuses.goLiveRejected,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusRejected
	}}
	template={dashboardTemplate}
/>

<Story
	name="All Complete"
	args={{
		statuses: onboardingStatuses.allComplete,
		kybStatus: kybStatusDefault,
		goLiveStatus: goLiveStatusDefault
	}}
	template={dashboardTemplate}
/>
