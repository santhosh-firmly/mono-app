<script context="module">
	import OnboardingTasks from './onboarding-tasks.svelte';
	export const meta = {
		title: 'Merchant/Onboarding/Onboarding Tasks',
		component: OnboardingTasks,
		parameters: {
			layout: 'padded'
		}
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';

	// Status definitions with all 7 tasks: integration, agreement, kyb, destinations, catalog, cdn, goLive

	const allPending = {
		integration: 'pending',
		agreement: 'pending',
		kyb: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	};

	const justStarted = {
		integration: 'in-progress',
		agreement: 'pending',
		kyb: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	};

	const agreementCompleted = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	};

	const kybPending = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'in-progress',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	};

	const kybRejected = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'rejected',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	};

	const kybApproved = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	};

	const midwayProgress = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'in-progress',
		cdn: 'pending',
		goLive: 'pending'
	};

	const almostDone = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'in-progress'
	};

	const goLiveRejected = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'rejected'
	};

	const allCompleted = {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'completed'
	};

	// Mock KYB and GoLive status objects for rejection scenarios
	const kybStatusRejected = {
		kyb_status: 'rejected',
		kyb_rejection_notes:
			'Business registration documents are expired. Please upload current documents.'
	};

	const goLiveStatusRejected = {
		go_live_status: 'rejected',
		go_live_rejection_notes:
			'Product images do not meet quality standards. Please update catalog images to at least 800x800px.'
	};
</script>

<Story name="All Pending (0%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={allPending} />
	</div>
</Story>

<Story name="Just Started - Integration In Progress">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={justStarted} />
	</div>
</Story>

<Story name="Agreement Completed">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={agreementCompleted} />
	</div>
</Story>

<Story name="KYB Pending Approval">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={kybPending} />
	</div>
</Story>

<Story name="KYB Rejected">
	<div class="max-w-2xl">
		<OnboardingTasks
			domain="merchant.com"
			statuses={kybRejected}
			kybStatus={kybStatusRejected}
		/>
	</div>
</Story>

<Story name="KYB Approved - Tasks Unlocked">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={kybApproved} />
	</div>
</Story>

<Story name="Midway Progress (57%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={midwayProgress} />
	</div>
</Story>

<Story name="Go Live Pending Approval">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={almostDone} />
	</div>
</Story>

<Story name="Go Live Rejected">
	<div class="max-w-2xl">
		<OnboardingTasks
			domain="merchant.com"
			statuses={goLiveRejected}
			goLiveStatus={goLiveStatusRejected}
		/>
	</div>
</Story>

<Story name="All Completed (100%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" statuses={allCompleted} />
	</div>
</Story>
