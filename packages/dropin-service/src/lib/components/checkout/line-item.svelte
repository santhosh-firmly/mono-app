<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiImage from '$lib/components/ui/image.svelte';

	/**
	 * @typedef {Object} LineItemPrice
	 * @property {number} value - Price value
	 * @property {string} [symbol] - Currency symbol
	 * @property {string} [formatted] - Pre-formatted price string
	 */

	/**
	 * @typedef {Object} LineItemProps
	 * @property {string} id - Line item ID
	 * @property {string} name - Product name
	 * @property {string} [description] - Product variant description
	 * @property {string} [imageUrl] - Product image URL
	 * @property {number} quantity - Current quantity
	 * @property {LineItemPrice} price - Unit price
	 * @property {LineItemPrice} [linePrice] - Total line price
	 * @property {boolean} [isLoading] - Loading state (e.g., updating quantity)
	 * @property {boolean} [isRemoving] - Removing state
	 * @property {number} [minQuantity] - Minimum quantity (default: 1)
	 * @property {number} [maxQuantity] - Maximum quantity (default: 99)
	 * @property {Function} onQuantityChange - Called when quantity changes
	 * @property {Function} onRemove - Called when item is removed
	 */

	/**
	 * @type {LineItemProps}
	 */
	let {
		id = '',
		name = '',
		description = '',
		imageUrl = '',
		quantity = 1,
		price = { value: 0, symbol: '$' },
		linePrice = null,
		isLoading = false,
		isRemoving = false,
		minQuantity = 1,
		maxQuantity = 99,
		onQuantityChange = () => {},
		onRemove = () => {}
	} = $props();

	let displayPrice = $derived(
		linePrice?.formatted || `${price.symbol || '$'}${(price.value * quantity).toFixed(2)}`
	);

	let unitPrice = $derived(price.formatted || `${price.symbol || '$'}${price.value.toFixed(2)}`);

	function handleIncrement() {
		if (quantity < maxQuantity && !isLoading) {
			onQuantityChange(id, quantity + 1);
		}
	}

	function handleDecrement() {
		if (quantity > minQuantity && !isLoading) {
			onQuantityChange(id, quantity - 1);
		}
	}

	function handleRemove() {
		if (!isLoading && !isRemoving) {
			onRemove(id);
		}
	}
</script>

<div
	class="flex gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-opacity {isRemoving
		? 'opacity-50'
		: ''}"
>
	<!-- Product Image -->
	<div class="size-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
		{#if imageUrl}
			<UiImage src={imageUrl} alt={name} class="size-full  object-cover" />
		{:else}
			<div class="flex size-full items-center justify-center text-gray-400">
				<Icon icon="mdi:image-outline" class="text-2xl" />
			</div>
		{/if}
	</div>

	<!-- Product Details -->
	<div class="flex min-w-0 flex-1 flex-col">
		<div class="flex items-start justify-between gap-2">
			<div class="min-w-0 flex-1">
				<h3 class="truncate text-sm font-medium text-gray-900">{name}</h3>
				{#if description}
					<p class="mt-0.5 truncate text-xs text-gray-500">{description}</p>
				{/if}
				<p class="mt-1 text-xs text-gray-500">{unitPrice} each</p>
			</div>

			<!-- Remove Button -->
			<button
				type="button"
				onclick={handleRemove}
				disabled={isLoading || isRemoving}
				class="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
				aria-label="Remove item"
			>
				<Icon icon="mdi:close" class="text-lg" />
			</button>
		</div>

		<!-- Quantity & Price -->
		<div class="mt-auto flex items-center justify-between pt-2">
			<!-- Quantity Controls -->
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={handleDecrement}
					disabled={quantity <= minQuantity || isLoading}
					class="flex size-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Decrease quantity"
				>
					<Icon icon="mdi:minus" class="text-sm" />
				</button>

				<span class="flex h-7 w-8 items-center justify-center text-sm font-medium">
					{#if isLoading}
						<Icon icon="svg-spinners:ring-resize" class="text-sm" />
					{:else}
						{quantity}
					{/if}
				</span>

				<button
					type="button"
					onclick={handleIncrement}
					disabled={quantity >= maxQuantity || isLoading}
					class="flex size-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Increase quantity"
				>
					<Icon icon="mdi:plus" class="text-sm" />
				</button>
			</div>

			<!-- Line Price -->
			<span class="text-sm font-semibold text-gray-900">{displayPrice}</span>
		</div>
	</div>
</div>
