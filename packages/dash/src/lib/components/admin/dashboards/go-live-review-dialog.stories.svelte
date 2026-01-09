<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GoLiveReviewDialog from './go-live-review-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Go Live Review Dialog',
		component: GoLiveReviewDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<GoLiveReviewDialog {...args} />
{/snippet}

<Story
	name="All Tasks Complete"
	args={{
		open: true,
		merchant: {
			domain: 'example-store.com',
			integration_complete: true,
			agreement_signed: true,
			kyb_status: 'approved',
			destinations_configured: true,
			catalog_configured: true,
			cdn_whitelisting_complete: true,
			company: {
				name: 'Example Store Inc.',
				employeeCount: '51-200',
				annualRevenue: '$1M-$10M'
			}
		},
		isSubmitting: false,
		error: ''
	}}
	{template}
/>

<Story
	name="Partial Progress"
	args={{
		open: true,
		merchant: {
			domain: 'partial-store.com',
			integration_complete: true,
			agreement_signed: true,
			kyb_status: 'approved',
			destinations_configured: false,
			catalog_configured: true,
			cdn_whitelisting_complete: false,
			company: {
				name: 'Partial Store LLC'
			}
		},
		isSubmitting: false,
		error: ''
	}}
	{template}
/>

<Story
	name="KYB Pending"
	args={{
		open: true,
		merchant: {
			domain: 'pending-kyb.com',
			integration_complete: true,
			agreement_signed: true,
			kyb_status: 'pending',
			destinations_configured: true,
			catalog_configured: true,
			cdn_whitelisting_complete: true,
			company: {
				name: 'Pending KYB Corp'
			}
		},
		isSubmitting: false,
		error: ''
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		open: true,
		merchant: {
			domain: 'error-store.com',
			integration_complete: true,
			agreement_signed: true,
			kyb_status: 'approved',
			destinations_configured: true,
			catalog_configured: true,
			cdn_whitelisting_complete: true
		},
		isSubmitting: false,
		error: 'Failed to update go-live status. Please try again.'
	}}
	{template}
/>

<Story
	name="Submitting"
	args={{
		open: true,
		merchant: {
			domain: 'submitting-store.com',
			integration_complete: true,
			agreement_signed: true,
			kyb_status: 'approved',
			destinations_configured: true,
			catalog_configured: true,
			cdn_whitelisting_complete: true
		},
		isSubmitting: true,
		error: ''
	}}
	{template}
/>
