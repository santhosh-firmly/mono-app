<script>
	// @ts-nocheck

	import { EmailSchema } from '$lib/browser/schema.js';
	import FormField from '$lib/components/common/form-field.svelte';
	import {
		Email,
		InfoPhone,
		InfoEmail,
		ViewTitleShopPayLogin,
		ViewTitleShopPayOtp,
		InfoShopPayEmail,
		InfoShopPayOTP
	} from '$lib/browser/localization.js';

	import { onDestroy, onMount, setContext } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import {
		cViewPayment,
		cViewShoppay,
		sWizardLast,
		wizardBack,
		wizardNext
	} from '$lib/browser/wizard.js';
	import {
		sCart,
		sWallet,
		sWalletInfo,
		shopPayWalletUnlockStart,
		shopPayWalletUnlockComplete
	} from '$lib/browser/api-manager.js';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import {
		cShopPayEmail,
		cShopPayOTP,
		sShopPayFlow,
		sNavBackHandler,
		sNavNextHandler
	} from '$lib/browser/storage.js';
	import OtpField from '$lib/components/common/otp-field.svelte';
	import ShopPayIcon from '$lib/components/common/svg/shop-pay-icon.svelte';

	let captcha;

	const {
		form: emailForm,
		errors: emailErrors,
		handleChange: emailHandleChange,
		handleSubmit: emailHandleSubmit
	} = createForm({
		initialValues: $sWalletInfo || EmailSchema.cast({ email: $sCart.shipping_info?.email }),
		validationSchema: EmailSchema,
		onSubmit: async (values) => {
			sWalletInfo.set(values);

			let codes;
			try {
				if (!captcha.children[0]) {
					await window.hcaptcha.render(captcha);
				}
				const captchaWidgetId = captcha.children[0].attributes['data-hcaptcha-widget-id'].value;
				codes = await window.hcaptcha.execute(captchaWidgetId, { async: true });
			} catch (e) {
				captcha.style.display = 'flex';
				console.log('in hcaptcha exception', e);
			}

			if (codes) {
				const res = await shopPayWalletUnlockStart(values.email, codes.response);
				if (res) {
					sShopPayFlow.set(cShopPayOTP);
				}
			}
		}
	});
	const loginKey = Symbol('shopPayLogin');
	setContext(loginKey, { form: emailForm, errors: emailErrors, handleChange: emailHandleChange });

	let otpEmailInfo, otpPhoneInfo;
	$: {
		otpEmailInfo = otpPhoneInfo = null;
		if ($sWallet.otp_destination) {
			if ($sWallet.otp_destination.emails) {
				otpEmailInfo = $sWallet.otp_destination.emails.join(',');
			}
			if ($sWallet.otp_destination.phones) {
				otpPhoneInfo = $sWallet.otp_destination.phones.join(',');
			}
		}
	}

	let otpComponent;
	function otpHandleSubmit() {
		otpComponent.handleSubmit();
	}

	async function onOtpComplete(otpValue) {
		let res = await shopPayWalletUnlockComplete(otpValue);
		if (res) {
			sShopPayFlow.set(cShopPayEmail);
			wizardNext();
		}
	}

	function onOTPBackHandler() {
		sShopPayFlow.set(cShopPayEmail);
	}

	function onNextHandler(event) {
		if ($sShopPayFlow == cShopPayOTP) {
			otpHandleSubmit(event);
		} else {
			emailHandleSubmit(event);
		}
	}

	function onBackHandler(event) {
		if ($sShopPayFlow == cShopPayOTP) {
			onOTPBackHandler(event);
		} else {
			wizardBack(event);
		}
	}

	onMount(() => {
		sNavNextHandler.set(onNextHandler);
		sNavBackHandler.set(onBackHandler);
		if ($sWizardLast == cViewPayment) {
			//Coming from payment and if the cart does have one valid shoppay wallet, then it is the repeat user flow.
			if ($sCart.payment_method_options) {
				let list = $sCart.payment_method_options.filter((e) => e.wallet == 'shoppay' && e.id);
				if (list.length > 0) {
					//assumption here is, we have more than one Shoppay address.
					wizardNext();
				}
			}
		}
	});

	onDestroy(() => {
		sWizardLast.set(cViewShoppay);
		sNavNextHandler.set(null);
		sNavBackHandler.set(null);
	});
</script>

<svelte:head>
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
</svelte:head>

{#if $sShopPayFlow == cShopPayEmail}
	<div id="viewShoppayLogin" fobs>
		<SectionHeader header={ViewTitleShopPayLogin} />
		<div class="flex flex-col gap-2 px-4">
			<div class="text-xs pb-5" />
			<div class="flex justify-center">
				<ShopPayIcon class="fill-[#5a31f4]" />
			</div>

			<div class="flex justify-center text-xs">{InfoShopPayEmail}</div>
			<form
				id="loginForm"
				on:submit={emailHandleSubmit}
				class="flex flex-col gap-2 px-1 py-4 justify-center"
			>
				<div class="flex sm:flex-row flex-col gap-2 justify-center">
					<FormField
						key={loginKey}
						id="email"
						label={Email}
						autocomplete="email"
						type="email"
						inputmode="email"
						required
					/>
				</div>
			</form>
			<div
				bind:this={captcha}
				style="display: none"
				class="h-captcha flex justify-center"
				data-sitekey="0bd1648b-c9c2-47fb-b1ca-75ce423d61d0"
			/>
		</div>
	</div>
{:else if $sShopPayFlow == cShopPayOTP}
	<div id="viewShoppayOtp" fobs>
		<SectionHeader header={ViewTitleShopPayOtp} />
		<div class="flex flex-col gap-2 mt-2 px-4">
			<div class="flex justify-center">
				<ShopPayIcon class="fill-[#5a31f4]" />
			</div>
			<div class="flex justify-center text-xs text-center">
				{InfoShopPayOTP}
			</div>
			{#if otpEmailInfo}
				<div class="flex justify-center text-xs text-center">
					{InfoEmail}<span class="pl-2 font-semibold">{otpEmailInfo}</span>
				</div>
			{/if}
			{#if otpPhoneInfo}
				<div class="flex justify-center text-xs text-center">
					{InfoPhone}<span class="pl-2 font-semibold">{otpPhoneInfo}</span>
				</div>
			{/if}

			<OtpField onOTPComplete={onOtpComplete} bind:this={otpComponent} />
		</div>
	</div>
{/if}
