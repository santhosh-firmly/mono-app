<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import {
		sMaskedOtpDestinations,
		c2pVisaAuthenticate,
		sWalletRememberMe,
		sWallet,
		sWalletReview,
		cartC2PWallet,
		cartCompleteOrder,
		sC2PAuthenticate
	} from '$lib-v4/browser/api-manager';
	import {
		InfoC2PNeedToVerify,
		InfoC2PVerificationOptions,
		// InfoC2PVerifyBankApp,
		InfoC2PVerifyOTPDestination,
		LinkResendOTP,
		ViewTitleC2PStepUp,
		ViewTitleC2PVerifyCode
	} from '$lib-v4/browser/localization';
	import {
		cC2PaymentMethodOTP,
		cC2PaymentVerificationMethods,
		sC2PaymentFlow,
		sIsNavPlaceOrder,
		sNavBackHandler,
		sNavNextHandler
	} from '$lib-v4/browser/storage';
	import { wizardBack, wizardNext } from '$lib-v4/browser/wizard';
	import C2pLogo from '$lib-v4/components/common/c2p-logo.svelte';
	import OtpField from '$lib-v4/components/common/otp-field.svelte';
	import SectionHeader from '$lib-v4/components/common/section-header.svelte';
	import Radio from '$lib-v4/components/vendor/radio.svelte';
	import { onMount } from 'svelte';

	let authenticationMethods;

	$: {
		if ($sWallet?.digitalCardData?.authenticationMethods) {
			authenticationMethods = $sWallet?.digitalCardData.authenticationMethods.filter(
				(method) => method.authenticationMethodType !== 'APP_AUTHENTICATION'
			);
		}
	}

	function onChange(event) {
		sMaskedOtpDestinations.set(event.currentTarget.value);
	}

	async function onSubmit() {
		if (
			$sMaskedOtpDestinations &&
			$sMaskedOtpDestinations?.authenticationMethodType !== 'APP_AUTHENTICATION'
		) {
			sC2PAuthenticate.set(await c2pVisaAuthenticate($sMaskedOtpDestinations));
			sIsNavPlaceOrder.set(true);
			sC2PaymentFlow.set(cC2PaymentMethodOTP);
		}
	}

	let otpComponent;

	function otpHandleSubmit() {
		otpComponent.handleSubmit();
	}

	async function onOTPSend() {
		await c2pVisaAuthenticate($sMaskedOtpDestinations);
	}

	async function onOtpComplete(otpValue) {
		const authenticationMethodOTP = structuredClone($sMaskedOtpDestinations);
		authenticationMethodOTP.methodAttributes.otpValue = otpValue;

		const responseAuthenticateOTP = await c2pVisaAuthenticate(authenticationMethodOTP);
		sC2PAuthenticate.set(responseAuthenticateOTP);
		if (responseAuthenticateOTP.authenticationResult === 'AUTHENTICATED') {
			const walletRes = await cartC2PWallet(
				$sWalletReview,
				$sWalletRememberMe,
				null,
				responseAuthenticateOTP.assuranceData
			);
			if (walletRes?.token) {
				if (!walletRes.cvv_required == true) {
					const placeRet = await cartCompleteOrder();
					if (placeRet) {
						wizardNext();
					}
				}
			}
		}
	}

	function onOTPBackHandler() {
		sIsNavPlaceOrder.set(false);
		sC2PaymentFlow.set(cC2PaymentVerificationMethods);
	}

	function onNextHandler(event) {
		if ($sC2PaymentFlow == cC2PaymentMethodOTP) {
			otpHandleSubmit(event);
		} else {
			onSubmit();
		}
	}

	function onBackHandler(event) {
		if ($sC2PaymentFlow == cC2PaymentMethodOTP) {
			onOTPBackHandler(event);
		} else {
			wizardBack(event);
		}
	}

	onMount(() => {
		if ($sWallet?.digitalCardData?.authenticationMethods) {
			authenticationMethods = $sWallet?.digitalCardData.authenticationMethods.filter(
				(method) => method.authenticationMethodType !== 'APP_AUTHENTICATION'
			);

			if ($sC2PaymentFlow == cC2PaymentVerificationMethods) {
				sMaskedOtpDestinations.set(authenticationMethods[0]);
			}
		} else {
			wizardNext();
		}

		sNavNextHandler.set(onNextHandler);
		sNavBackHandler.set(onBackHandler);
	});
</script>

{#if $sC2PaymentFlow == cC2PaymentVerificationMethods}
	<div id="viewC2PVerificationMethods" fobs>
		<div class="flex flex-col gap-3 pb-4">
			<SectionHeader header={ViewTitleC2PStepUp} />
			<div class="flex justify-center">
				<C2pLogo />
			</div>
			<div class="mb-2 px-4 text-sm">
				{InfoC2PNeedToVerify}
			</div>
			<div class="px-4 text-sm">
				{InfoC2PVerificationOptions}
			</div>
		</div>
		<div class="px-4">
			<ul>
				{#if authenticationMethods}
					{#each authenticationMethods.filter( (o) => ['SMS_OTP', 'EMAIL_OTP'].includes(o.authenticationMethodType) ) as option}
						<li>
							<Radio
								class="py-2"
								on:change={onChange}
								checked={option === $sMaskedOtpDestinations}
								value={option}
							>
								{#if option.authenticationMethodType === 'SMS_OTP'}
									<span class="font-normal"
										>Text code to <strong>{option?.authenticationCredentialReference}</strong></span
									>
								{/if}
								{#if option.authenticationMethodType === 'EMAIL_OTP'}
									<span class="font-normal"
										>Email code to <strong>{option?.authenticationCredentialReference}</strong
										></span
									>
								{/if}
								<!-- TODO: How do we implement this option to open visa's app -->
								<!-- {#if option.authenticationMethodType === 'APP_AUTHENTICATION'}
                                    <span>In your <strong>bank app</strong></span>
                                {/if} -->
							</Radio>
						</li>
						<!-- TODO: We need to show the user's card number -->
						<!-- {#if option.authenticationMethodType === 'APP_AUTHENTICATION'}
                            <div class="pl-6 text-sm">{InfoC2PVerifyBankApp($sWallet?.panLastFour)}</div>
                        {/if} -->
					{/each}
				{/if}
			</ul>
		</div>
	</div>
{:else if $sC2PaymentFlow == cC2PaymentMethodOTP}
	<div id="viewC2POTPStepup">
		<SectionHeader header={ViewTitleC2PVerifyCode} />
		<div class="mt-2 flex flex-col gap-3 px-4">
			<div class="flex justify-center pb-4">
				<C2pLogo />
			</div>
			<div class="mb-4 px-4 text-sm">
				{@html InfoC2PVerifyOTPDestination(
					$sMaskedOtpDestinations?.authenticationCredentialReference
				)}
			</div>
			<div>
				<OtpField onOTPComplete={onOtpComplete} bind:this={otpComponent} />
			</div>
			<button
				class="flex cursor-pointer justify-center text-center text-xs underline"
				on:click={onOTPSend}
			>
				{LinkResendOTP}
			</button>
		</div>
	</div>
{/if}
