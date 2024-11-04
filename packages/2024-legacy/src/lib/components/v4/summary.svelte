<script>
	// @ts-nocheck
	import { formatCurrency } from '$lib/utils.js';
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

<div class="w-full flex flex-col gap-4 text-fy-on-primary py-4 max-w-[800px] mx-auto">
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
		/>
	{:else}
		<LineItem />
	{/each}
	<div class="ml-[5.5rem] flex flex-col text-sm">
		<hr class="my-3" />
		<div class="flex flex-col gap-5">
			<div class="flex flex-row justify-between font-semibold">
				{#if skeleton}
					<div class="w-24 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
					<div class="text-right w-12 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
				{:else}
					<span>Subtotal</span>
					<span class="text-right">{formatCurrency(subtotal)}</span>
				{/if}
			</div>
			{#if !skeleton}
				<PromoCodes {coupons} {addPromoCodeCallback} {clearPromoCodesCallback} />
			{/if}
			{#if discountsBreakdown}
				<div class="flex flex-col justify-between text-fy-on-primary-accent gap-5 font-semibold">
					{#each discountsBreakdown as db (db.label)}
						<div class="flex flex-row justify-between" data-testid="discount">
							<span> {db.label} </span>
							<span class="text-right font-semibold">
								(-{formatCurrency(db.discount)})
							</span>
						</div>
					{/each}
				</div>
			{:else if discount?.value > 0}
				<div
					transition:slide
					class="flex flex-row justify-between text-fy-on-primary-subtle gap-2 items-start"
				>
					<div class="flex flex-col text-left">
						<span> Discount </span>
					</div>
					<span class="text-right">
						(-{formatCurrency(discount)})
					</span>
				</div>
			{/if}
			<div class="flex flex-row justify-between text-fy-on-primary-subtle gap-2 items-start">
				{#if skeleton}
					<div class="flex flex-col text-left">
						<div class="w-24 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
						<div class="w-32 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
					</div>
					<div class="text-right w-12 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
				{:else}
					<div class="flex flex-col text-left">
						<span> Shipping </span>
						{#if shippingMethod}
							<span class="text-xs"> {shippingMethod.description} </span>
						{/if}
					</div>
					<span class="text-right">
						{#if calculating}
							Calculating...
						{:else if shippingMethod}
							{shippingMethod.price.value === 0 ? 'Free' : formatCurrency(shippingMethod.price)}
						{:else}
							Enter shipping address
						{/if}
					</span>
				{/if}
			</div>
			<div class="flex flex-row justify-between text-fy-on-primary-subtle gap-2">
				{#if skeleton}
					<div class="w-24 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
					<div class="text-right w-12 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
				{:else}
					<span>Tax</span>
					<span class="text-right">
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
				<div class="flex flex-row justify-between text-fy-on-primary-subtle gap-2 items-start">
					<div class="flex flex-col text-left">
						<span> Store Credit </span>
					</div>
					<span class="text-right">
						(-{formatCurrency(storeCredit)})
					</span>
				</div>
			{/if}
			{#if rewardPoints?.value > 0}
				<div class="flex flex-row justify-between text-fy-on-primary-subtle gap-2 items-start">
					<div class="flex flex-col text-left">
						<span> Reward Points </span>
					</div>
					<span class="text-right">
						(-{formatCurrency(rewardPoints)})
					</span>
				</div>
			{/if}
		</div>
		<hr class="my-3" />
		<div class="flex flex-col gap-5">
			<div class="flex flex-row justify-between font-semibold">
				{#if skeleton}
					<div class="w-24 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
					<div class="text-right w-12 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
				{:else}
					<span>Total due today</span>
					<span class="text-right">{formatCurrency(total)}</span>
				{/if}
			</div>
			{#if monthlyRecurring}
				<div class="flex flex-row justify-between text-fy-on-primary-subtle">
					<span>Due monthly</span>
					<span class="text-right"
						>{formatCurrency({ currency: 'USD', value: monthlyRecurring })}/mo<br />after 1 month</span
					>
				</div>
			{/if}
		</div>
	</div>
</div>
