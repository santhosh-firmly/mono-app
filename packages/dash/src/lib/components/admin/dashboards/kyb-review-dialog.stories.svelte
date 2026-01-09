<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import KybReviewDialog from './kyb-review-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/KYB Review Dialog',
		component: KybReviewDialog,
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
	<KybReviewDialog {...args} />
{/snippet}

<Story
	name="Complete Information"
	args={{
		open: true,
		merchant: {
			domain: 'complete-business.com',
			company: {
				name: 'Complete Business Inc.',
				employeeCount: '51-200',
				annualRevenue: '$1M-$10M',
				address: {
					street: '123 Business Ave',
					city: 'San Francisco',
					state: 'CA',
					postalCode: '94102',
					country: 'United States'
				}
			},
			contact: {
				name: 'John Smith',
				email: 'john@complete-business.com',
				phone: '+1 (555) 123-4567'
			}
		},
		isSubmitting: false,
		error: ''
	}}
	{template}
/>

<Story
	name="Minimal Information"
	args={{
		open: true,
		merchant: {
			domain: 'minimal-store.com',
			company: {
				name: 'Minimal Store'
			},
			contact: {
				email: 'contact@minimal-store.com'
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
			domain: 'error-case.com',
			company: {
				name: 'Error Case Corp'
			},
			contact: {
				name: 'Jane Doe',
				email: 'jane@error-case.com'
			}
		},
		isSubmitting: false,
		error: 'Failed to update KYB status. Please try again.'
	}}
	{template}
/>

<Story
	name="Submitting"
	args={{
		open: true,
		merchant: {
			domain: 'submitting.com',
			company: {
				name: 'Submitting Corp',
				employeeCount: '11-50'
			},
			contact: {
				name: 'Test User',
				email: 'test@submitting.com'
			}
		},
		isSubmitting: true,
		error: ''
	}}
	{template}
/>
