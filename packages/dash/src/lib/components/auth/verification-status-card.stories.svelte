<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import VerificationStatusCard from './verification-status-card.svelte';

	const { Story } = defineMeta({
		title: 'Authentication/Verification Status Card',
		component: VerificationStatusCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			status: {
				control: 'select',
				options: ['verifying', 'success', 'error'],
				description: 'Current verification status'
			},
			errorMessage: { control: 'text', description: 'Error message when status is error' },
			successMessage: {
				control: 'text',
				description: 'Success message when status is success'
			}
		}
	});
</script>

{#snippet template(args)}
	<VerificationStatusCard {...args} />
{/snippet}

<Story name="Verifying" args={{ status: 'verifying' }} {template} />

<Story
	name="Success"
	args={{
		status: 'success',
		successMessage: "You're now signed in. Redirecting..."
	}}
	{template}
/>

<Story
	name="Error"
	args={{
		status: 'error',
		errorMessage: 'Verification failed. Please try again.'
	}}
	{template}
/>

<Story
	name="Invalid Link Error"
	args={{
		status: 'error',
		errorMessage: 'Invalid login link. Please request a new one.'
	}}
	{template}
/>

<Story
	name="Expired Link Error"
	args={{
		status: 'error',
		errorMessage: 'This link has expired. Please request a new one.'
	}}
	{template}
/>
