<script>
	// @ts-nocheck
	import CardImage from './card-image.svelte';
	import { formatCurrency } from '../../utils.js';
	import QuantityController from './quantity-controller.svelte';

	/**
	 * Title or description of the product
	 */
	export let description = '';

	/**
	 * Description of the product variant
	 */
	export let variantDescription = '';

	/**
	 * Product quantity
	 * @type {number}
	 */
	export let quantity;

	export let updateQuantity;
	export let disabled;

	/**
	 * Total line item price
	 * @type {object}
	 * @property {string} currency - The 3 letter currency code.
	 * @property {float} amount - The price value.
	 */
	export let price;

	/**
	 * MSRP for a single line item if any
	 */
	export let msrp = '';

	/**
	 * Product/variant image
	 */
	export let image;

	/**
	 * Recurring period if any
	 */
	export let recurringPeriod;

	/**
	 * Allow change quantity
	 */
	export let allowChangeQuantity = true;

	/**
	 * Show image border on the line items
	 */
	export let showImageBorder = true;

	function getRecurringPeriodDisplay(period) {
		switch (period) {
			case 'monthly':
				return '/mo';
			case 'yearly':
				return '/yr';
			case 'weekly':
				return '/wk';
			default:
				return `/${period}`;
		}
	}
</script>

<div class="flex w-full flex-row gap-2">
	<div class="w-[5rem] min-w-[5rem]">
		<CardImage src={image} {showImageBorder} alt="Product" />
	</div>
	<div class="flex grow flex-col py-1 text-left">
		{#if !description}
			<div
				class="text-fy-on-primary bg-fy-on-primary-subtle2 m-1 h-4 w-20 animate-pulse rounded text-sm font-semibold"
			/>
			<div
				class="text-fy-on-primary-subtle bg-fy-on-primary-subtle2 m-1 h-4 w-28 animate-pulse rounded text-xs"
			/>
		{:else}
			<span class="text-fy-on-primary text-sm font-semibold" data-testid="line-item-description"
				>{description}</span
			>
			<span class="text-fy-on-primary-subtle text-xs">{variantDescription || ''}</span>
			{#if allowChangeQuantity}
				<QuantityController {quantity} {disabled} updateItemQuantityImmediately={updateQuantity} />
			{/if}
		{/if}
	</div>
	<div class="flex flex-col py-1">
		{#if !price}
			<div
				class="text-fy-on-primary bg-fy-on-primary-subtle2 my-1 h-4 w-12 animate-pulse rounded text-right text-sm font-semibold"
			/>
		{:else if recurringPeriod}
			<span class="text-fy-on-primary text-right text-sm font-semibold whitespace-nowrap"
				>$0 today</span
			>
		{:else}
			<span
				class="text-fy-on-primary text-right text-sm font-semibold"
				data-testid="line-item-price">{formatCurrency(price)}</span
			>
		{/if}
		{#if msrp?.amount && price.amount !== msrp?.amount * quantity}
			<span class="text-fy-on-primary-subtle text-right text-xs line-through"
				>{formatCurrency({ ...msrp, amount: msrp.amount * quantity })}</span
			>
		{/if}
		{#if recurringPeriod}
			<span class="text-fy-on-primary-subtle text-right text-xs"
				>{formatCurrency(price) + getRecurringPeriodDisplay(recurringPeriod)}</span
			>
		{/if}
	</div>
</div>
