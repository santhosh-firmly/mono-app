<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiInput from '$lib/components/ui/input.svelte';

	/**
	 * @typedef {Object} CheckoutPromoCodeProps
	 * @property {Array} appliedCodes - List of applied promo codes
	 * @property {Function} onApply - Callback when applying a promo code
	 * @property {Function} onRemove - Callback when removing a promo code
	 * @property {boolean} isLoading - Loading state
	 * @property {string} error - Error message
	 */

	/** @type {CheckoutPromoCodeProps} */
	let {
		appliedCodes = [],
		onApply = () => {},
		onRemove = () => {},
		isLoading = false,
		error = ''
	} = $props();

	let promoCode = $state('');
	let showInput = $state(false);

	function handleApply() {
		if (promoCode.trim()) {
			onApply(promoCode.trim());
			promoCode = '';
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			handleApply();
		}
	}
</script>

<div class="space-y-3">
	<!-- Applied Promo Codes -->
	{#if appliedCodes.length > 0}
		<div class="space-y-2">
			{#each appliedCodes as code (code.code || code)}
				<div
					class="flex items-center justify-between rounded bg-green-50 px-3 py-2 text-sm"
				>
					<div class="flex items-center gap-2">
						<Icon icon="mdi:tag" class="text-green-600" />
						<span class="font-medium text-green-700">{code.code || code}</span>
						{#if code.discount}
							<span class="text-xs text-green-600">(-{code.discount})</span>
						{/if}
					</div>
					<button
						onclick={() => onRemove(code.code || code)}
						disabled={isLoading}
						class="text-green-600 hover:text-green-800 disabled:opacity-50"
						aria-label="Remove promo code"
					>
						<Icon icon="mdi:close" class="text-lg" />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Add Promo Code -->
	{#if !showInput}
		<button
			onclick={() => (showInput = true)}
			class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
		>
			<Icon icon="mdi:tag-plus" />
			<span>Add promo code</span>
		</button>
	{:else}
		<div class="space-y-2">
			<div class="flex gap-2">
				<UiInput
					placeholder="Enter promo code"
					value={promoCode}
					onChange={(value) => (promoCode = value)}
					onKeydown={handleKeydown}
					errorMessage={error}
				/>
				<button
					onclick={handleApply}
					disabled={isLoading || !promoCode.trim()}
					class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
				>
					{isLoading ? 'Applying...' : 'Apply'}
				</button>
			</div>
			<button
				onclick={() => {
					showInput = false;
					promoCode = '';
				}}
				class="text-xs text-gray-600 hover:text-gray-800"
			>
				Cancel
			</button>
		</div>
	{/if}

	{#if error}
		<div class="flex items-center gap-2 text-sm text-red-600">
			<Icon icon="mdi:alert-circle" />
			<span>{error}</span>
		</div>
	{/if}
</div>
