<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OtpPage from './otp-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Auth/OTP Verification',
		component: OtpPage,
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
		<OtpPage
			email="user@example.com"
			otp={['', '', '', '', '', '']}
			error=""
			isVerifying={false}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Partially Filled">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['1', '2', '3', '', '', '']}
			error=""
			isVerifying={false}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Complete Code">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['1', '2', '3', '4', '5', '6']}
			error=""
			isVerifying={false}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Verifying">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['1', '2', '3', '4', '5', '6']}
			error=""
			isVerifying={true}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Resending Code">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['', '', '', '', '', '']}
			error=""
			isVerifying={false}
			isResending={true}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Invalid Code Error">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['1', '2', '3', '4', '5', '6']}
			error="Invalid code. Please try again."
			isVerifying={false}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Expired Code Error">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['9', '8', '7', '6', '5', '4']}
			error="Code has expired. Please request a new one."
			isVerifying={false}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>

<Story name="Too Many Attempts Error">
	{#snippet template()}
		<OtpPage
			email="user@example.com"
			otp={['', '', '', '', '', '']}
			error="Too many failed attempts. Please try again later."
			isVerifying={false}
			isResending={false}
			onOtpChange={noop}
			onVerify={noopAsync}
			onResend={noopAsync}
			onBack={noop}
		/>
	{/snippet}
</Story>
