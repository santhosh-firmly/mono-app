<script>
	// @ts-nocheck

	// BUGBUG: We should find a better way to disable captcha instead of changing the code
	// in order to do testing. This is ill-advised.
	import { PUBLIC_DISABLE_HCAPTCHA } from '$env/static/public';

	import ShopPayIcon from '$lib-v4/components/common/svg/shop-pay-icon.svelte';
	import BaseLogin from '../base-login.svelte';
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants.js';
	import { createEventDispatcher } from 'svelte';
	import Modal from '../modal.svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Whether or not the Shop Pay pop up is open
	 */
	export let isModalOpen = false;

	let email;
	let captcha;
	let popupStep;
	let otpPhoneDestination;
	let emailError;
	let otpError;

	export let getHCaptcha = async () => {
		if (PUBLIC_DISABLE_HCAPTCHA === 'true') {
			return 'disabledcaptcha';
		}

		try {
			if (!captcha.children[0]) {
				await window.hcaptcha.render(captcha);
			}
			const captchaWidgetId = captcha.children[0].attributes['data-hcaptcha-widget-id'].value;
			return await window.hcaptcha.execute(captchaWidgetId, { async: true });
		} catch (e) {
			captcha.style.display = 'flex';
		}
	};

	async function shopPaySendOtp(event) {
		let captchaFingerprint = await getHCaptcha();
		if (captchaFingerprint) {
			const res = await window.firmly.shopPayWalletUnlockStart(
				event.detail.email,
				captchaFingerprint.response
			);
			if (res.status === 200) {
				otpPhoneDestination = res.data.otp_destination.phones[0];
				popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
				email = event.detail.email;
			} else {
				emailError = res.data?.description || res.data;
				popupStep = BASE_LOGIN_STEPS.WAITING_EMAIL;
			}
		}
	}

	async function shopPayValidateOtp(event) {
		popupStep = BASE_LOGIN_STEPS.PROCESSING_OTP;
		const res = await window.firmly.shopPayWalletUnlockComplete(event.detail.otpValue);
		if (res.status === 200) {
			otpError = '';
			dispatch('login-successful', Object.assign({ email }, res.data));
		} else {
			otpError = res.data?.description || res.data;
			popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
		}
	}

	$: {
		if (!isModalOpen) {
			popupStep = BASE_LOGIN_STEPS.WAITING_EMAIL;
		}
	}
</script>

<svelte:head>
	<script src="https://js.hcaptcha.com/1/api.js" defer></script>
</svelte:head>

<Modal bind:isModalOpen on:modalClosed>
	<BaseLogin
		loginProviderName="Shop Pay"
		subtitle="ShopPay selected"
		buttonClasses="bg-[#5a31f4] hover:bg-[#390ced] text-white"
		textClasses="text-[#5a31f4] hover:text-[#390ced]"
		termsOfServiceLink="https://shop.app/terms-of-service"
		privacyPolicyLink="https://www.shopify.com/legal/privacy/app-users"
		otpAlternativeMethodText=""
		bind:phone={otpPhoneDestination}
		bind:emailError
		bind:otpError
		bind:currentStep={popupStep}
		on:emailSet={shopPaySendOtp}
		on:otpCompleted={shopPayValidateOtp}
	>
		<ShopPayIcon slot="logo" width={null} height={16} class="fill-[#5a31f4]" />
		<div slot="button-logo" class="p-1">
			<ShopPayIcon width={null} height={16} class="fill-white" />
		</div>
		<div
			slot="additional-content"
			bind:this={captcha}
			style="display: none"
			class="h-captcha flex justify-center"
			data-sitekey="0bd1648b-c9c2-47fb-b1ca-75ce423d61d0"
		/>
	</BaseLogin>
</Modal>
