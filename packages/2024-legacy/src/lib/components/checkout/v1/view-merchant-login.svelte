<script>
	// @ts-nocheck
	import { EmailSchema } from '$lib/browser/schema.js';
	import FormField from '$lib/components/common/form-field.svelte';
	import {
		Email,
		InfoEmail,
		InfoPhone,
		InfoStoreLoginHeader,
		LinkResendOTP
	} from '$lib/browser/localization.js';
	import { createForm } from 'svelte-forms-lib';
	import { cViewLogin, sWizardLast, wizardBack, wizardNext } from '$lib/browser/wizard.js';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import {
		sNavBackHandler,
		sNavNextHandler,
		sLoginOtpFlow,
		cLoginOtpEmail,
		cLoginOtpValidation,
		sLoginEmail,
		sLoginOtpDestinations
	} from '$lib/browser/storage.js';
	import {
		sShippingInfo,
		sCart,
		sessionCreateOtp,
		sessionValidateOtp,
		sSignedInOnThisSession
	} from '$lib/browser/api-manager.js';
	import { onDestroy, onMount, setContext } from 'svelte';
	import OtpField from '$lib/components/common/otp-field.svelte';
	import AdoremeLogoLarge from '$lib/components/common/svg/adoreme-logo-large.svelte';
	import { postSignIn } from '$lib/browser/cross.js';

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: { email: $sShippingInfo?.email },
		validationSchema: EmailSchema,
		onSubmit: onSubmit
	});

	let otpEmailInfo;
	let otpPhoneInfo;

	$: {
		otpEmailInfo = otpPhoneInfo = null;
		if ($sLoginOtpDestinations?.otp_destination) {
			if ($sLoginOtpDestinations.otp_destination.emails) {
				otpEmailInfo = $sLoginOtpDestinations.otp_destination.emails.join(',');
			}
			if ($sLoginOtpDestinations.otp_destination.phones) {
				otpPhoneInfo = $sLoginOtpDestinations.otp_destination.phones.join(',');
			}
		}
	}

	const key = Symbol('MerchantLogin');
	setContext(key, { form, errors, handleChange });

	async function onSubmit(values) {
		sLoginEmail.set(values.email);
		sendOTP(values.email);
	}

	function onNextHandler(event) {
		if ($sLoginOtpFlow === cLoginOtpValidation) {
			otpHandleSubmit(event);
		} else {
			handleSubmit(event);
		}
	}

	function onBackHandler(event) {
		if ($sLoginOtpFlow === cLoginOtpValidation) {
			sLoginOtpFlow.set(cLoginOtpEmail);
		} else {
			wizardBack(event);
		}
	}

	onMount(() => {
		sNavNextHandler.set(onNextHandler);
		sNavBackHandler.set(onBackHandler);
	});

	onDestroy(() => {
		sNavBackHandler.set(null);
		sNavNextHandler.set(null);
	});

	let otpComponent;
	function otpHandleSubmit() {
		otpComponent.handleSubmit();
	}

	async function onOtpComplete(otpValue) {
		const res = await sessionValidateOtp($sLoginEmail, otpValue);
		if (res) {
			sCart.set(res);
			if (res.session?.is_logged_in) {
				if (res.session.cookies && res.session.cookies.length > 0) {
					postSignIn(res.session.cookies);
					sSignedInOnThisSession.set(true);
				}
			}
			sLoginOtpFlow.set(cLoginOtpEmail);
			sWizardLast.set(cViewLogin);
			wizardNext();
		}
	}

	async function sendOTP(email) {
		const res = await sessionCreateOtp(email || $sLoginEmail);
		if (res?.otp_destination) {
			sLoginOtpDestinations.set(res);
			sLoginOtpFlow.set(cLoginOtpValidation);
		}
	}
</script>

{#if $sLoginOtpFlow === cLoginOtpEmail}
	<div fobs>
		<form on:submit={handleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
			<SectionHeader header="Fast password-less checkout" />
			<div class="flex flex-col text-sm items-center gap-2 px-4 py-5">
				<AdoremeLogoLarge class="mx-2 my-1" />
				<span class="mt-2">Enter your email to continue</span>
			</div>
			<div class="flex sm:flex-row flex-col gap-2 px-4">
				<FormField {key} id="email" label={Email} autocomplete="email" type="email" required />
			</div>
			<div class="flex sm:flex-row flex-col gap-2 px-4 py-5">
				<div class="flex flex-row gap-2 justify-start items-center text-xs text-primary leading-5">
					<span
						>By continuing, you agree to Adore Me's <a
							class="text-blue-500"
							target="_blank"
							href={$sCart.urls?.privacy_policy || '#'}>Privacy Notice</a
						></span
					>
				</div>
			</div>
		</form>
	</div>
{:else if $sLoginOtpFlow === cLoginOtpValidation}
	<div fobs>
		<SectionHeader header={InfoStoreLoginHeader($sCart.display_name || $sCart.shop_id)} />
		<div class="flex flex-col gap-3 mt-2 px-4">
			<div class="flex justify-center">
				<AdoremeLogoLarge class="mx-2 my-1" />
			</div>
			<div class="flex justify-center text-xs text-center">
				Enter the one-time code {$sCart.display_name || $sCart.shop_id} sent to
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
			<button
				class="flex justify-center text-xs text-center underline cursor-pointer"
				on:click={sendOTP}
			>
				{LinkResendOTP}
			</button>
		</div>
	</div>
{/if}
