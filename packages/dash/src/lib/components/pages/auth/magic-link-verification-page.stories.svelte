<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import MagicLinkVerificationPage from './magic-link-verification-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Auth/Magic Link Verification',
		component: MagicLinkVerificationPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			onRetry: fn()
		}
	});
</script>

{#snippet template(args)}
	<MagicLinkVerificationPage {...args} />
{/snippet}

<Story name="Verifying" args={{ status: 'verifying' }} {template} />

<Story name="Success" args={{ status: 'success' }} {template} />

<Story
	name="Error - Invalid Link"
	args={{
		status: 'error',
		errorMessage: 'Invalid login link. Please request a new one.'
	}}
	{template}
/>

<Story
	name="Error - Expired Link"
	args={{
		status: 'error',
		errorMessage: 'This login link has expired. Please request a new one.'
	}}
	{template}
/>

<Story
	name="Error - Already Used"
	args={{
		status: 'error',
		errorMessage: 'This login link has already been used. Please request a new one.'
	}}
	{template}
/>

<Story
	name="Error - Generic"
	args={{
		status: 'error',
		errorMessage: 'Verification failed. Please try again.'
	}}
	{template}
/>
