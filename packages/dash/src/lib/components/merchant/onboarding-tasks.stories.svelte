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

	const allPending = {
		integration: 'pending',
		agreement: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending'
	};

	const justStarted = {
		integration: 'in-progress',
		agreement: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending'
	};

	const midwayProgress = {
		integration: 'completed',
		agreement: 'completed',
		destinations: 'in-progress',
		catalog: 'pending',
		cdn: 'pending'
	};

	const almostDone = {
		integration: 'completed',
		agreement: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'in-progress'
	};

	const allCompleted = {
		integration: 'completed',
		agreement: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed'
	};
</script>

<Story name="All Pending (0%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" initialStatuses={allPending} />
	</div>
</Story>

<Story name="Just Started (0%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" initialStatuses={justStarted} />
	</div>
</Story>

<Story name="Midway Progress (40%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" initialStatuses={midwayProgress} />
	</div>
</Story>

<Story name="Almost Done (80%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" initialStatuses={almostDone} />
	</div>
</Story>

<Story name="All Completed (100%)">
	<div class="max-w-2xl">
		<OnboardingTasks domain="merchant.com" initialStatuses={allCompleted} />
	</div>
</Story>
