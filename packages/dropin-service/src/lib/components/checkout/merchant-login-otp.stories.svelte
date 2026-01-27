<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import MerchantLoginOtp from './merchant-login-otp.svelte';

	const { Story } = defineMeta({
		title: 'Work in Progress/Merchant Login/OTP',
		component: MerchantLoginOtp,
		parameters: {
			layout: 'centered'
		},
		args: {
			email: 'john@example.com',
			error: '',
			loading: false,
			onSubmit: fn(),
			onResend: fn(),
			onChangeEmail: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80 rounded-lg border border-gray-200 bg-white p-4 shadow">
		<MerchantLoginOtp {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="With Error" args={{ error: 'Invalid code. Please try again.' }} {template} />

<Story name="Loading" args={{ loading: true }} {template} />

<Story name="Long Email" args={{ email: 'very.long.email.address@example.com' }} {template} />
