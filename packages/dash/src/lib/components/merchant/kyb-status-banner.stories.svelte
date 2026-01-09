<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import KybStatusBanner from './kyb-status-banner.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Onboarding/KYB Status Banner',
		component: KybStatusBanner,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<KybStatusBanner {...args} />
{/snippet}

<Story
	name="Pending"
	args={{
		kybStatus: {
			kyb_status: 'pending'
		}
	}}
	{template}
/>

<Story
	name="Approved"
	args={{
		kybStatus: {
			kyb_status: 'approved'
		}
	}}
	{template}
/>

<Story
	name="Rejected"
	args={{
		kybStatus: {
			kyb_status: 'rejected',
			kyb_rejection_notes:
				'Business documentation is incomplete. Please provide a valid business license.'
		}
	}}
	{template}
/>

<Story
	name="No Status"
	args={{
		kybStatus: null
	}}
	{template}
/>

<Story name="All Statuses">
	<div class="space-y-4">
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Pending Review</p>
			<KybStatusBanner kybStatus={{ kyb_status: 'pending' }} />
		</div>
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Approved</p>
			<KybStatusBanner kybStatus={{ kyb_status: 'approved' }} />
		</div>
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Rejected</p>
			<KybStatusBanner
				kybStatus={{
					kyb_status: 'rejected',
					kyb_rejection_notes: 'Missing required documentation for business verification.'
				}}
			/>
		</div>
	</div>
</Story>
