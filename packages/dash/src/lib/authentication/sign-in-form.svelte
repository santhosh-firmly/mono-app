<script>
	let { azureAdClientId, azureAdRedirectUrl, azureAdTenantId } = $props();

	let altSignInWithMS = $state('Sign In with Microsoft');

	let MSUrl = $derived.by(() => {
		const url = new URL(
			`https://login.microsoftonline.com/${azureAdTenantId}/oauth2/v2.0/authorize`
		);
		url.searchParams.set('client_id', azureAdClientId);
		url.searchParams.set('scope', 'openid profile email');
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('redirect_uri', azureAdRedirectUrl);

		return url;
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
