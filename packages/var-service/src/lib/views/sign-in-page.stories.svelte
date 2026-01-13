<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SignInPage from './sign-in-page.svelte';

	const { Story } = defineMeta({
		title: 'Views/SignInPage',
		component: SignInPage,
		parameters: {
			layout: 'fullscreen'
		}
	});

	const mockProps = {
		azureAdClientId: '12345678-1234-1234-1234-123456789012',
		azureAdRedirectUrl: 'http://localhost:5173/auth/callback',
		azureAdTenantId: '87654321-4321-4321-4321-210987654321',
		oauthState: 'random-state-string-12345'
	};
</script>

<Story name="Default">
	{#snippet template()}
		<SignInPage {...mockProps} error={null} />
	{/snippet}
</Story>

<Story name="With Error">
	{#snippet template()}
		<SignInPage {...mockProps} error={true} />
	{/snippet}
</Story>
