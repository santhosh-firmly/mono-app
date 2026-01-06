<script>
	import SignInPage from '$lib/views/sign-in-page.svelte';

	const { data } = $props();
</script>

<SignInPage
	azureAdClientId={data.azureAdClientId}
	azureAdTenantId={data.azureAdTenantId}
	azureAdRedirectUrl={data.azureAdRedirectUrl}
	oauthState={data.state}
	error={data.error}
/>
