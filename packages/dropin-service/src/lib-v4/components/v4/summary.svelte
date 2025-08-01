<script>
	// @ts-nocheck
	import { formatCurrency } from '$lib-v4/utils.js';
	import { slide } from 'svelte/transition';
	import LineItem from './line-item.svelte';
	import PromoCodes from './promo-codes.svelte';

	/**
	 * Whether or not to show the "calculating..." text
	 */
	export let calculating = false;

	/**
	 * List of items to display
	 */
	export let lineItems = null;

	export let updateQuantity = () => {};
	export let disabled = false;

	/**
	 * Object mapping line_item_id to error message
	 */
	export let lineItemErrors = {};

	export let coupons = null;
	export let subtotal = null;
	export let discount = null;
	export let discountsBreakdown = null;
	export let storeCredit = null;
	export let rewardPoints = null;
	export let shippingMethod = null;
	export let tax = null;
	export let total = null;
	export let showImageBorder = true;

	/**
	 * Display mode for the summary
	 * 'header' - Used in the header component (always expanded)
	 * 'collapsible' - Used in the main flow with collapsible line items
	 */
	export let displayMode = 'header';

	/**
	 * This is used to determine the origin of the summary, which is used to determine the layout of the summary
	 */
	export let toggleLineItemsExpanded = false;

	let skeleton = false;
	let monthlyRecurring;

	export let addPromoCodeCallback;
	export let clearPromoCodesCallback;

	$: {
		monthlyRecurring = (lineItems || [])
			.filter((l) => l.recurring === 'monthly')
			.reduce((sum, l) => sum + l.price.value, 0);
	}

	$: {
		skeleton = !subtotal;
	}
</script>

<div class="text-fy-on-primary mx-auto flex w-full max-w-[800px] flex-col gap-4 py-4">
	{#if displayMode === 'header' || (displayMode === 'collapsible' && toggleLineItemsExpanded)}
		<div class="flex flex-col gap-4" transition:slide={{ duration: 300 }}>
			{#each lineItems || [] as item (item.line_item_id)}
				<LineItem
					image={item.image.url}
					quantity={item.quantity}
					description={item.description}
					variantDescription={item.variant_description}
					msrp={item.msrp}
					price={item.line_price}
					recurringPeriod={item.recurring}
					updateQuantity={(qty) => updateQuantity(item, qty)}
					allowChangeQuantity={!item.fixed_quantity}
					{disabled}
					{showImageBorder}
					errorMessage={lineItemErrors?.[item.line_item_id] || ''}
				/>
			{:else}
				<LineItem />
			{/each}
		</div>
	{/if}
	<div class="flex flex-col text-sm">
		<hr class="my-3" />
		<div class="flex flex-col gap-5">
			{#if !skeleton}
				<PromoCodes {coupons} {addPromoCodeCallback} {clearPromoCodesCallback} />
			{/if}
			{#if discountsBreakdown}
				<div
					class="text-fy-on-primary-accent flex flex-col justify-between gap-5 font-semibold"
				>
					{#each discountsBreakdown as db (db.label)}
						<div class="flex flex-row justify-between" data-testid="discount">
							<span> {db.label} </span>
							<span
								class="text-right font-semibold"
								data-testid="discount-breakdown-{db.label
									.toLowerCase()
									.replace(/\s+/g, '-')}"
							>
								(-{formatCurrency(db.discount)})
							</span>
						</div>
					{/each}
				</div>
			{:else if discount?.value > 0}
				<div
					transition:slide
					class="text-fy-on-primary-subtle flex flex-row items-start justify-between gap-2"
				>
					<div class="flex flex-col text-left">
						<span> Discount </span>
					</div>
					<span class="text-right" data-testid="discount-value">
						(-{formatCurrency(discount)})
					</span>
				</div>
			{/if}
			<div class="flex flex-row justify-between font-semibold">
				{#if skeleton}
					<div class="bg-fy-on-primary-subtle2 m-1 h-4 w-24 animate-pulse rounded" />
					<div
						class="bg-fy-on-primary-subtle2 m-1 h-4 w-12 animate-pulse rounded text-right"
					/>
				{:else}
					<span>Subtotal</span>
					<span class="text-right" data-testid="subtotal-value"
						>{formatCurrency(subtotal)}</span
					>
				{/if}
			</div>
			<div class="text-fy-on-primary-subtle flex flex-row items-start justify-between gap-2">
				{#if skeleton}
					<div class="flex flex-col text-left">
						<div class="bg-fy-on-primary-subtle2 m-1 h-4 w-24 animate-pulse rounded" />
						<div class="bg-fy-on-primary-subtle2 m-1 h-4 w-32 animate-pulse rounded" />
					</div>
					<div
						class="bg-fy-on-primary-subtle2 m-1 h-4 w-12 animate-pulse rounded text-right"
					/>
				{:else}
					<div class="flex flex-col text-left">
						<span> Shipping </span>
						{#if shippingMethod}
							<span class="text-xs" data-testid="shipping-method-description">
								{shippingMethod.description}
							</span>
						{/if}
					</div>
					<span class="text-right" data-testid="shipping-value">
						{#if calculating}
							Calculating...
						{:else if shippingMethod}
							{shippingMethod.price.value === 0
								? 'Free'
								: formatCurrency(shippingMethod.price)}
						{:else}
							Enter shipping address
						{/if}
					</span>
				{/if}
			</div>
			<div class="text-fy-on-primary-subtle flex flex-row justify-between gap-2">
				{#if skeleton}
					<div class="bg-fy-on-primary-subtle2 m-1 h-4 w-24 animate-pulse rounded" />
					<div
						class="bg-fy-on-primary-subtle2 m-1 h-4 w-12 animate-pulse rounded text-right"
					/>
				{:else}
					<span>Tax</span>
					<span class="text-right" data-testid="tax-value">
						{#if calculating}
							Calculating...
						{:else if shippingMethod}
							{formatCurrency(tax) || '-'}
						{:else}
							Enter shipping address
						{/if}
					</span>
				{/if}
			</div>
			{#if storeCredit?.value > 0}
				<div
					class="text-fy-on-primary-subtle flex flex-row items-start justify-between gap-2"
				>
					<div class="flex flex-col text-left">
						<span> Store Credit </span>
					</div>
					<span class="text-right" data-testid="store-credit-value">
						(-{formatCurrency(storeCredit)})
					</span>
				</div>
			{/if}
			{#if rewardPoints?.value > 0}
				<div
					class="text-fy-on-primary-subtle flex flex-row items-start justify-between gap-2"
				>
					<div class="flex flex-col text-left">
						<span> Reward Points </span>
					</div>
					<span class="text-right" data-testid="reward-points-value">
						(-{formatCurrency(rewardPoints)})
					</span>
				</div>
			{/if}
		</div>
		<hr class="my-3" />
		<div class="flex flex-col gap-5">
			<div class="flex flex-row justify-between font-semibold">
				{#if skeleton}
					<div class="bg-fy-on-primary-subtle2 m-1 h-4 w-24 animate-pulse rounded" />
					<div
						class="bg-fy-on-primary-subtle2 m-1 h-4 w-12 animate-pulse rounded text-right"
					/>
				{:else}
					<span>Total due today</span>
					<span class="text-right" data-testid="total-due-today"
						>{formatCurrency(total)}</span
					>
				{/if}
			</div>
			{#if monthlyRecurring}
				<div class="text-fy-on-primary-subtle flex flex-row justify-between">
					<span>Due monthly</span>
					<span class="text-right" data-testid="due-monthly"
						>{formatCurrency({ currency: 'USD', value: monthlyRecurring })}/mo<br
						/>after 1 month</span
					>
				</div>
			{/if}
		</div>
	</div>
</div>
