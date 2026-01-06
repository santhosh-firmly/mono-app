<script>
	import SignInPage from '$lib/views/sign-in-page.svelte';

	let { data } = $props();
</script>

<SignInPage
	azureAdClientId={data.azureAdClientId}
	azureAdTenantId={data.azureAdTenantId}
	azureAdRedirectUrl={data.azureAdRedirectUrl}
/>
