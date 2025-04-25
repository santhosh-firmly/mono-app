<script>
	import {
		PUBLIC_AZURE_AD_CLIENT_ID,
		PUBLIC_AZURE_AD_TENANT_ID,
		PUBLIC_AZURE_REDIRECT_URL
	} from '$env/static/public';

	let altSignInWithMS = 'Sign In with Microsoft';

	const MSUrl = new URL(
		`https://login.microsoftonline.com/${PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`
	);
	MSUrl.searchParams.set('client_id', PUBLIC_AZURE_AD_CLIENT_ID);
	MSUrl.searchParams.set('scope', 'openid profile email');
	MSUrl.searchParams.set('response_type', 'code');
	MSUrl.searchParams.set('redirect_uri', PUBLIC_AZURE_REDIRECT_URL);
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
