<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import Collapsible from '$lib/components/common/collapsible.svelte';
	import { ShippingInfoSchema } from '$lib/browser/schema.js';
	import FormField from '$lib/components/common/form-field.svelte';
	import {
		Address1,
		Address2,
		City,
		Email,
		FirstName,
		InfoC2POTPDetail,
		InfoC2POTPHeader,
		InfoC2PPrivacy,
		InfoC2PRememberMe,
		InfoC2PRememberMeLong,
		InfoEmail,
		InfoOTP,
		InfoPhone,
		LastName,
		LinkResendOTP,
		Phone,
		ShippingAddressSearch,
		State,
		ViewTitleC2POtp,
		ViewTitleContact,
		ViewTitleShippingAddress,
		Zip
	} from '$lib/browser/localization.js';
	import { createForm } from 'svelte-forms-lib';
	import {
		cViewContactShippingAddress,
		sWizardLast,
		wizardBack,
		wizardNext
	} from '$lib/browser/wizard.js';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import {
		cC2PaymentEmail,
		cC2PaymentOTP,
		cPaymentC2P,
		cPaymentCreditCard,
		sC2PaymentFlow,
		sNavBackHandler,
		sNavNextHandler,
		sPaymentFlow
	} from '$lib/browser/storage.js';
	import {
		c2pWalletUnlockComplete,
		c2pWalletUnlockStart,
		cartUpdateShippingInfo,
		getAddress,
		sShippingInfo,
		sWallet,
		sWalletRememberMe,
		searchAddress
	} from '$lib/browser/api-manager.js';
	import { onDestroy, onMount, setContext } from 'svelte';
	import OtpField from '$lib/components/common/otp-field.svelte';
	import Alert from '$lib/components/common/alert.svelte';
	import C2pLogo from '$lib/components/common/c2p-logo.svelte';
	import AutoComplete from '$lib/components/vendor/auto-complete.svelte';

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: $sShippingInfo,
		validationSchema: ShippingInfoSchema,
		onSubmit: onSubmit
	});

	async function onSubmit(values) {
		// Save the intermediate state, so that, we can show the same address during on the mount.
		sShippingInfo.set(values);
		if (values.isC2P) {
			const res = await c2pWalletUnlockStart(values.email);
			if (res) {
				if (res.recognized) {
					const cartInfo = await cartUpdateShippingInfo($sShippingInfo);
					if (cartInfo) {
						sC2PaymentFlow.set(cC2PaymentEmail);
						sPaymentFlow.set(cPaymentC2P);
						wizardNext();
					}
				} else {
					sC2PaymentFlow.set(cC2PaymentOTP);
				}
			} else {
				values.isC2P = false;
				sShippingInfo.set(values);
			}
		}
		if (!values.isC2P) {
			const cartInfo = await cartUpdateShippingInfo(values);
			if (cartInfo) {
				sPaymentFlow.set(cPaymentCreditCard);
				wizardNext();
			}
		}
	}

	const key = Symbol('C2PContactShippingInfo');
	setContext(key, { form, errors, handleChange });

	function onNextHandler(event) {
		if ($sC2PaymentFlow == cC2PaymentOTP) {
			otpHandleSubmit(event);
		} else {
			handleSubmit(event);
		}
	}

	function onOTPBackHandler() {
		sC2PaymentFlow.set(cC2PaymentEmail);
	}

	function onBackHandler(event) {
		if ($sC2PaymentFlow == cC2PaymentOTP) {
			onOTPBackHandler(event);
		} else {
			wizardBack(event);
		}
	}

	onMount(() => {
		sNavNextHandler.set(onNextHandler);
		sNavBackHandler.set(onBackHandler);
	});

	onDestroy(() => {
		sWizardLast.set(cViewContactShippingAddress);
		sNavBackHandler.set(null);
		sNavNextHandler.set(null);
	});

	let otpComponent;
	function otpHandleSubmit() {
		otpComponent.handleSubmit();
	}

	async function onOtpComplete(otpValue) {
		const res = await c2pWalletUnlockComplete(otpValue);
		if (res) {
			const cartInfo = await cartUpdateShippingInfo($sShippingInfo);
			if (cartInfo) {
				sC2PaymentFlow.set(cC2PaymentEmail);
				sPaymentFlow.set(cPaymentC2P);
				wizardNext();
			}
		}
	}

	async function onOTPSend() {
		await c2pWalletUnlockStart($sShippingInfo.email);
	}

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

	async function onAddressChange(item) {
		if (item) {
			const ret = await getAddress(item.id);
			if (ret) {
				if (ret.address2) {
					$form.address2 = ret.address2;
				}
				$form.city = ret.city;
				$form.country = ret.country;
				$form.postal_code = ret.postal_code;
				$form.state_name = ret.state_name;
				$form.state_or_province = ret.state_or_province;
			}
		}
	}
</script>

{#if $sC2PaymentFlow == cC2PaymentEmail}
	<div id="viewC2PLogin" fobs>
		<form on:submit={handleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
			<SectionHeader header={ViewTitleContact} />
			<div class="flex sm:flex-row flex-col gap-2 px-4">
				<FormField {key} id="email" label={Email} autocomplete="email" type="email" required />
				<FormField {key} id="phone" label={Phone} autocomplete="tel" type="tel" required />
			</div>
			<div class="flex sm:flex-row flex-col gap-2 px-4">
				<div class="flex flex-row gap-2 justify-start items-center text-xs text-secondary">
					<input type="checkbox" bind:checked={$form.isC2P} />
					<span>{@html InfoC2PPrivacy}</span>
				</div>
			</div>

			<SectionHeader header={ViewTitleShippingAddress} />

			<div class="flex sm:flex-row flex-col gap-2 px-4">
				<FormField
					{key}
					id="first_name"
					label={FirstName}
					autocomplete="given-name"
					type="text"
					required
				/>
				<FormField
					{key}
					id="last_name"
					label={LastName}
					autocomplete="family-name"
					type="text"
					required
				/>
			</div>
			<div class="flex sm:flex-col flex-col gap-2 px-4">
				<AutoComplete
					id="address1"
					label={Address1}
					autocomplete="shipping address-line1"
					type="text"
					required
					bind:text={$form.address1}
					searchFunction={searchAddress}
					labelFieldName="address"
					valueFieldName="address1"
					localFiltering={false}
					delay={250}
					minCharactersToSearch={3}
					placeholder={ShippingAddressSearch}
					onChange={onAddressChange}
				/>
				<FormField
					{key}
					id="address2"
					label={Address2}
					autocomplete="shipping address-line2"
					type="text"
				/>
			</div>
			<div class="flex sm:flex-row flex-col gap-2 px-4">
				<FormField
					{key}
					id="postal_code"
					label={Zip}
					autocomplete="shipping postal-code"
					type="tel"
					required
				/>

				<FormField
					{key}
					id="city"
					label={City}
					autocomplete="shipping address-level2"
					type="text"
					required
				/>
				<FormField
					{key}
					id="state_or_province"
					label={State}
					autocomplete="shipping address-level1"
					type="text"
					required
				/>
			</div>
		</form>
	</div>
{:else if $sC2PaymentFlow == cC2PaymentOTP}
	<div id="viewC2POTP" fobs>
		<Alert header={InfoC2POTPHeader} detail={InfoC2POTPDetail} />
		<SectionHeader header={ViewTitleC2POtp} />
		<div class="flex flex-col gap-3 mt-2 px-4">
			<div class="flex justify-center">
				<C2pLogo />
			</div>
			<div class="flex justify-center text-xs text-center">
				{InfoOTP}
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
			<Collapsible
				shortText={InfoC2PRememberMe}
				longText={InfoC2PRememberMeLong}
				checked={$sWalletRememberMe}
				on:change={(ev) => {
					sWalletRememberMe.set(ev.detail.target.checked);
				}}
			/>
			<button
				class="flex justify-center text-xs text-center underline cursor-pointer"
				on:click={onOTPSend}
			>
				{LinkResendOTP}
			</button>
		</div>
	</div>
{/if}
