<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LoginPage from './login-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Auth/Login',
		component: LoginPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	const noop = () => {};
	const noopAsync = async () => {};
</script>

<Story name="Default">
	{#snippet template()}
		<LoginPage
			email=""
			error=""
			isLoading={false}
			isLoadingOtp={false}
			emailSent={false}
			sentMethod=""
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="With Email Entered">
	{#snippet template()}
		<LoginPage
			email="user@example.com"
			error=""
			isLoading={false}
			isLoadingOtp={false}
			emailSent={false}
			sentMethod=""
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="Sending Magic Link">
	{#snippet template()}
		<LoginPage
			email="user@example.com"
			error=""
			isLoading={true}
			isLoadingOtp={false}
			emailSent={false}
			sentMethod=""
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="Sending OTP">
	{#snippet template()}
		<LoginPage
			email="user@example.com"
			error=""
			isLoading={false}
			isLoadingOtp={true}
			emailSent={false}
			sentMethod=""
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="Magic Link Sent">
	{#snippet template()}
		<LoginPage
			email="user@example.com"
			error=""
			isLoading={false}
			isLoadingOtp={false}
			emailSent={true}
			sentMethod="magic"
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="OTP Code Sent">
	{#snippet template()}
		<LoginPage
			email="user@example.com"
			error=""
			isLoading={false}
			isLoadingOtp={false}
			emailSent={true}
			sentMethod="otp"
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="With Error">
	{#snippet template()}
		<LoginPage
			email="invalid-email"
			error="Please enter a valid email address"
			isLoading={false}
			isLoadingOtp={false}
			emailSent={false}
			sentMethod=""
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>

<Story name="User Not Found Error">
	{#snippet template()}
		<LoginPage
			email="unknown@example.com"
			error="No account found with this email address"
			isLoading={false}
			isLoadingOtp={false}
			emailSent={false}
			sentMethod=""
			signupUrl="/signup/verify-domain"
			onEmailChange={noop}
			onMagicLink={noopAsync}
			onOtpLogin={noopAsync}
			onReset={noop}
		/>
	{/snippet}
</Story>
