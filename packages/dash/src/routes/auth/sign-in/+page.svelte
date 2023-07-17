<script lang="ts">
	// Refer to https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
	import { PUBLIC_AZURE_AD_CLIENT_ID, PUBLIC_AZURE_AD_TENANT_ID, PUBLIC_AZURE_REDIRECT_URL } from '$env/static/public';

	import SignIn from '$lib/authentication/SignIn.svelte';
	import { onMount } from 'svelte';

	let title = 'Sign in to firmly Dashboard';
	let site = {
		name: 'Firmly Dash',
		img: 'https://flowbite-admin-dashboard.vercel.app/images/logo.svg',
		link: 'https://dash.firmly.tools/',
		imgAlt: 'Firmly Logo'
	};
	let rememberMe = false;
	let lostPassword = false;
	let createAccount = false;
	let showLogin = false;
	let lostPasswordLink = 'forgot-password';
	let loginTitle = 'Login to your account';
	let registerLink = 'sign-up';
	let createAccountTitle = 'Create account';
	let altSignInWithMS = 'Sign In with Microsoft';

	let isDarkMode = false;

	onMount(async () => {
		isDarkMode = document.documentElement.classList.contains('dark');
	});

    const MSUrl = new URL(`https://login.microsoftonline.com/${PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`);
    MSUrl.searchParams.set('client_id', PUBLIC_AZURE_AD_CLIENT_ID);
    MSUrl.searchParams.set('scope', 'openid profile email');
    MSUrl.searchParams.set('response_type', 'code');
    MSUrl.searchParams.set('redirect_uri', PUBLIC_AZURE_REDIRECT_URL);
</script>

<SignIn
	{title}
	{site}
	{rememberMe}
	{lostPassword}
	{createAccount}
	{lostPasswordLink}
	{loginTitle}
	{registerLink}
	{createAccountTitle}
	{showLogin}
>
	<div>
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
</SignIn>
