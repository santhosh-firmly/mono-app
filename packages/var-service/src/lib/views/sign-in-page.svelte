<script>
	let { azureAdClientId, azureAdRedirectUrl, azureAdTenantId } = $props();

	let altSignInWithMS = $state('Sign In with Microsoft');

	let MSUrl = $derived.by(() => {
		const url = new URL(
			'https://login.microsoftonline.com/' + azureAdTenantId + '/oauth2/v2.0/authorize'
		);
		url.searchParams.set('client_id', azureAdClientId);
		url.searchParams.set('scope', 'openid profile email');
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('redirect_uri', azureAdRedirectUrl);

		return url;
	});
</script>

<div class="relative container flex h-screen flex-col items-center justify-center">
	<div class="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-112.5">
		<div class="flex flex-col space-y-4 text-center">
			<h1 class="text-3xl font-semibold tracking-tight">Welcome to Firmly VAR</h1>
			<p class="text-muted-foreground text-base">Log in to continue</p>
		</div>
		<div class="grid gap-8">
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
		<p class="text-muted-foreground px-8 text-center text-sm">
			By continuing, you agree to our
			<a
				href="https://www.firmly.ai/terms"
				target="_blank"
				class="hover:text-primary underline underline-offset-4"
			>
				Terms of Service
			</a>
			and
			<a
				href="https://www.firmly.ai/privacy"
				target="_blank"
				class="hover:text-primary underline underline-offset-4"
			>
				Privacy Policy
			</a>
			.
		</p>
	</div>
</div>
