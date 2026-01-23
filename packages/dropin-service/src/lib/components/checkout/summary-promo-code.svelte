<script>
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiInput from '$lib/components/ui/input.svelte';
	import UiSmallButton from '$lib/components/ui/small-button.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} SummaryPromocodeProps
	 * @property {Array<string>} promocodes - The list of promocodes
	 * @property {string} promocode - The current promocode to be applied
	 * @property {boolean} isSubmitting - Whether the promo code is being submitted
	 * @property {boolean} isRemovingAll - Whether all promocodes are being removed
	 * @property {string} error - Error message to display
	 * @property {Function} onSubmit - The function to call when the promo code is submitted
	 * @property {Function} onRemoveAll - The function to call when all promocodes are removed
	 */

	/**
	 * @type {SummaryPromocodeProps}
	 */
	let {
		promocodes = [],
		promocode = $bindable(''),
		isSubmitting = false,
		isRemovingAll = false,
		error = '',
		onSubmit = () => {},
		onRemoveAll = () => {}
	} = $props();

	let isClicked = $state(Boolean(promocode));
	let inputRef = $state(null);

	function handleClick() {
		if (isSubmitting || isRemovingAll) return;
		isClicked = !isClicked;
	}

	function handleClickOutside() {
		if (isSubmitting || isRemovingAll) return;
		isClicked = false;
	}

	$effect(() => {
		if (isClicked) inputRef.focus();
	});

	$effect(() => {
		if (promocodes.includes(promocode)) promocode = '';
	});
</script>

{#snippet loadingSpinner()}
	<Icon icon="eos-icons:loading" class="text-muted size-4 animate-spin" />
{/snippet}

<div class="flex flex-col gap-y-2.5">
	<div class="frosted relative flex h-10 w-full items-center justify-center rounded-lg text-sm">
		{#if !isClicked && !isSubmitting}
			<button
				onclick={handleClick}
				class="absolute inset-0 size-full cursor-pointer {isRemovingAll
					? 'cursor-not-allowed opacity-50'
					: ''}"
				disabled={isRemovingAll}
				in:fade={{ duration: 150, delay: 150 }}
				out:fade={{ duration: 150 }}>{m.add_promotion_code()}</button
			>
		{:else}
			<div
				class="absolute inset-0 size-full"
				in:fade={{ duration: 150, delay: 150 }}
				out:fade={{ duration: 150 }}
			>
				<UiInput
					bind:ref={inputRef}
					bind:value={promocode}
					clickoutside={handleClickOutside}
					onPressEnter={() => onSubmit(promocode)}
					placeholder={m.add_promotion_code()}
					disabled={isSubmitting}
				>
					{#snippet suffix()}
						{#if isSubmitting}
							{@render loadingSpinner()}
						{:else}
							<UiSmallButton onclick={() => onSubmit(promocode)}
								>{m.apply()}</UiSmallButton
							>
						{/if}
					{/snippet}
				</UiInput>
			</div>
		{/if}
	</div>
	{#if promocodes.length > 0}
		<div class="flex items-center justify-between">
			<div class="flex flex-1 flex-wrap gap-2">
				{#each promocodes as code (code)}
					<div
						class="frosted flex w-fit items-center rounded-lg px-2 py-1.5 transition-all duration-200"
					>
						<Icon icon="mdi:tag" class="text-muted text-xs" />
						<div class="mx-2 h-3 w-px bg-gray-300"></div>
						<span class="text-xs font-medium text-gray-600">{code}</span>
					</div>
				{/each}
			</div>

			{#if isRemovingAll}
				{@render loadingSpinner()}
			{:else}
				<button onclick={onRemoveAll} class="text-muted cursor-pointer text-xs underline"
					>{m.remove_all()}</button
				>
			{/if}
		</div>
	{/if}
	{#if error}
		<span class="text-danger text-xs">{error}</span>
	{/if}
</div>
