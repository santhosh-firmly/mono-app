<script>
	let { azureAdClientId, azureAdTenantId, azureAdRedirectUrl } = $props();

	let altSignInWithMS = $state('Sign In with Microsoft');

	let MSUrl = $derived(
		new URL(`https://login.microsoftonline.com/${azureAdTenantId}/oauth2/v2.0/authorize`)
	);

	$effect(() => {
		MSUrl.searchParams.set('client_id', azureAdClientId);
		MSUrl.searchParams.set('scope', 'openid profile email');
		MSUrl.searchParams.set('response_type', 'code');
		MSUrl.searchParams.set('redirect_uri', azureAdRedirectUrl);
	});
</script>

<div class="grid gap-6">
	<a href={MSUrl.toString()}>
		<img
			class="mx-auto dark:hidden"
			src="/ms-symbollockup_signin_light.svg"
			alt={altSignInWithMS}
		/>
		<img
			class="mx-auto hidden dark:block"
			src="/ms-symbollockup_signin_dark.svg"
			alt={altSignInWithMS}
		/>
	</a>
</div>
