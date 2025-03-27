<script>
	import Icon from '@iconify/svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';
	import UiSmallButton from '$lib/components/ui/ui-small-button.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CartSummaryPromoCodeProps
	 * @property {Array<string>} promocodes - The list of promocodes
	 * @property {string} promocode - The current promocode to be applied
	 * @property {boolean} isSubmitting - Whether the promo code is being submitted
	 * @property {boolean} isRemovingAll - Whether all promocodes are being removed
	 * @property {Function} onSubmit - The function to call when the promo code is submitted
	 * @property {Function} onRemoveAll - The function to call when all promocodes are removed
	 */

	/**
	 * @type {CartSummaryPromoCodeProps}
	 */
	let {
		promocodes = [],
		promocode = $bindable(''),
		isSubmitting = false,
		isRemovingAll = false,
		onSubmit = () => {},
		onRemoveAll = () => {}
	} = $props();

	let isClicked = $state(Boolean(promocode));
	let inputRef = $state(null);

	function handleClick() {
		if (isSubmitting) return;
		isClicked = !isClicked;
	}

	$effect(() => {
		if (isClicked) inputRef.focus();
	});

	$effect(() => {
		if (promocodes.includes(promocode)) promocode = '';
	});
</script>

{#snippet loadingSpinner()}
	<Icon icon="eos-icons:loading" class="text-muted h-4 w-4 animate-spin" />
{/snippet}

<div class="flex flex-col gap-y-2.5">
	<div
		class="flex h-10 w-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm shadow"
	>
		{#if !isClicked || isSubmitting || isRemovingAll}
			<button
				onclick={handleClick}
				class="h-full w-full cursor-pointer {isSubmitting || isRemovingAll
					? 'cursor-not-allowed opacity-50'
					: ''}"
				disabled={isSubmitting || isRemovingAll}>{m.add_promotion_code()}</button
			>
		{:else}
			<UiInput
				bind:ref={inputRef}
				bind:value={promocode}
				onlyShowSuffixWhenValue
				clickoutside={handleClick}
				onPressEnter={() => onSubmit(promocode)}
				placeholder={m.add_promotion_code()}
				disabled={isSubmitting || isRemovingAll}
			>
				{#snippet suffix()}
					{#if isSubmitting || isRemovingAll}
						{@render loadingSpinner()}
					{:else}
						<UiSmallButton onclick={() => onSubmit(promocode)}>{m.apply()}</UiSmallButton>
					{/if}
				{/snippet}
			</UiInput>
		{/if}
	</div>
	{#if promocodes.length > 0}
		<div class="flex items-center justify-between">
			<div class="flex flex-1 flex-wrap gap-2">
				{#each promocodes as promocode (promocode)}
					<div
						class="flex w-fit items-center justify-between gap-1.5 rounded-lg border border-gray-200 p-1.5 shadow"
					>
						<Icon icon="mdi:tag" class="text-muted text-xs" />
						<span class="text-[.7rem] text-gray-500">{promocode}</span>
					</div>
				{/each}
			</div>

			{#if isRemovingAll}
				{@render loadingSpinner()}
			{:else}
				<button onclick={onRemoveAll} class="text-muted cursor-pointer text-xs underline"
					>Remove all</button
				>
			{/if}
		</div>
	{/if}
</div>
