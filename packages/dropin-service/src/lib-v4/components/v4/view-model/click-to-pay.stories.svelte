<script>
	/* @ts-nocheck */

	import ClickToPay from './click-to-pay.svelte';
	import ClickToPayUnified from './click-to-pay-unified.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import FlowSinglePage from '../flow-single-page.svelte';

	import '../theme.css';
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants';
</script>

<Meta
	title="Checkout V4/View Models/Click to Pay Popup"
	component={ClickToPay}
	tags={['autodocs']}
	parameters={{
		fullscreen: true
	}}
/>

<Template>
	<div class="h-screen w-full bg-zinc-200">
		<ClickToPay
			isModalOpen={true}
			c2pOTPDestination={{
				emails: ['samuelsmith@testing.com', 'johnsmith@example.com'],
				phones: ['(•••) •••-•875', '1234564478']
			}}
		/>
	</div>
</Template>

<Story name="Default">
	<FlowSinglePage />
	<ClickToPay
		isModalOpen={true}
		otpEmailInfo="samuelsmith@testing.com"
		otpPhoneInfo="(•••) •••-•875"
	/>
</Story>

<Story name="Unified (Mastercard)">
	<FlowSinglePage />
	<ClickToPayUnified
		isModalOpen={true}
		showC2pCheckbox={true}
		otpEmailInfo="samuelsmith@testing.com"
		otpPhoneInfo="(•••) •••-•875"
	/>
</Story>

<Story name="With C2P Checkbox">
	<FlowSinglePage />
	<ClickToPay
		isModalOpen={true}
		showC2pCheckbox={true}
		popupStep={BASE_LOGIN_STEPS.WAITING_OTP}
		otpEmailInfo="samuelsmith@testing.com"
		otpPhoneInfo="(•••) •••-•875"
	/>
</Story>

<Story name="Waiting OTP Stepup">
	<FlowSinglePage />
	<ClickToPay
		isModalOpen={true}
		popupStep={BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP}
		isWaitingStepupOtp={true}
		showSecondSlot={true}
		otpReference="******8080"
		contentHeaderText="Confirm it's you"
	/>
</Story>
