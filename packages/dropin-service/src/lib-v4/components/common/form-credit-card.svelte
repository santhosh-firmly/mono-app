<script>
	// @ts-nocheck
	import { CardName, CardNumber, CVC, ExpiryDate } from '$lib-v4/browser/localization.js';

	import { getContext } from 'svelte';
	import {
		EmptyCardInfo,
		formatCardNumber,
		formatExpiry,
		getCardTypeByValue,
		validateCreditCard,
		validateCVC,
		validateExpiryDate
	} from '$lib-v4/browser/credit-card-helper.js';
	import FloatingLabelInput from '$lib-v4/components/vendor/floating-label-input.svelte';
	import Helper from '$lib-v4/components/common/error.svelte';

	export let key = Symbol();
	let context = getContext(key);
	const { handleChange, form, errors } = context;

	let cardComponent = EmptyCardInfo.component;

	$: {
		let t = getCardTypeByValue($form.cardNumber);
		if (cardComponent !== t.component) {
			cardComponent = t.component;
		}
	}

	function handleExpiryKeyup(evt) {
		let fe = formatExpiry(evt);
		evt.target.value = fe;
	}

	function handleCCNumberKeyup(evt) {
		let cc = formatCardNumber(evt);
		evt.target.value = cc.formatted;
	}
	let innerWidth;
</script>

<svelte:window bind:innerWidth />

<fieldset
	class="justify-left flex basis-full flex-row gap-1 rounded-md border px-1 py-0.5 sm:gap-3"
>
	{#if innerWidth > 335}
		<span class="self-center pr-0.5 sm:pl-1"><svelte:component this={cardComponent} /></span>
	{/if}
	<input
		class="max-w-[19ch] min-w-[19ch] rounded-md border-0 px-0.5 text-sm focus:rounded-md sm:max-w-[25ch] sm:min-w-[25ch] sm:px-3 {$errors.cardNumber
			? 'bg-red-200'
			: 'bg-slate-100'}"
		type="tel"
		inputmode="numeric"
		autoComplete="billing cc-number"
		required
		id="cardNumber"
		bind:value={$form.cardNumber}
		on:change={handleChange}
		on:keydown={validateCreditCard}
		on:keyup={handleCCNumberKeyup}
		placeholder={CardNumber}
		maxlength="19"
	/>

	<input
		class="max-w-[7ch] min-w-[7ch] rounded-md border-0 px-0.5 text-sm focus:rounded-md sm:max-w-[11ch] sm:min-w-[11ch] sm:px-3 {$errors.expiryDate
			? 'bg-red-200'
			: 'bg-slate-100'}"
		type="tel"
		inputmode="numeric"
		autoComplete="billing cc-exp"
		required
		id="expiryDate"
		bind:value={$form.expiryDate}
		on:change={handleChange}
		on:keydown={validateExpiryDate}
		on:keyup={handleExpiryKeyup}
		placeholder={ExpiryDate}
		maxlength="6"
	/>
	<input
		class="max-w-[5ch] min-w-[5ch] rounded-md border-0 px-0.5 text-sm focus:rounded-md sm:max-w-[7ch] sm:min-w-[7ch] sm:px-3 {$errors.cvc
			? 'bg-red-200'
			: 'bg-slate-100'}"
		type="password"
		inputmode="numeric"
		autoComplete="billing cc-csc"
		required
		id="cvc"
		bind:value={$form.cvc}
		on:change={handleChange}
		on:keydown={validateCVC}
		placeholder={CVC}
		maxlength="4"
	/>
</fieldset>
<div class="flex flex-row">
	<Helper
		color="red"
		class="basis-3/4"
		helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 pr-2 self-center"
		>{$errors.cardNumber || $errors.expiryDate || $errors.cvc}</Helper
	>
	{#if innerWidth <= 335}
		<span class="flex basis-1/4 justify-end pr-0.5 sm:pl-1"
			><svelte:component this={cardComponent} /></span
		>
	{/if}
</div>

<FloatingLabelInput
	style="outlined"
	id="cardName"
	name="cardName"
	label={CardName}
	autocomplete="name given-name"
	type="text"
	inputmode="text"
	on:change={handleChange}
	bind:value={$form.cardName}
/>
{#if $errors.cardName}
	<Helper color="red">{$errors.cardName}</Helper>
{/if}
