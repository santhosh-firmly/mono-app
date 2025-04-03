<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import Group from './group.svelte';
	import { formatCurrency } from '$lib-v4/utils.js';

	/**
	 * List of shipping methods to be rendered
	 */
	export let shippingMethods = null;

	/**
	 * SKU of the currently selected shipping method
	 */
	export let selectedShippingMethod = null;

	/**
	 * Whether or not API calls that changes the shipping methods are in progress;
	 */
	export let inProgress = false;

	/**
	 * Whether or not the form elements are disabled
	 */
	export let disabled = false;

	const dispatch = createEventDispatcher();

	function onChange(event) {
		selectedShippingMethod = event.currentTarget.value;
		dispatch('set-shipping-method', selectedShippingMethod);
	}

	function isFirst(shippingMethods, index) {
		return index === 0;
	}

	function isLast(shippingMethods, index) {
		return index === shippingMethods.length - 1;
	}
</script>

<Group>
	{#if !shippingMethods}
		{@const mockEntries = [0, 1]}
		<!-- eslint-ignore no-unused-vars -->
		{#each mockEntries as index}
			<label
				class="col-span-2 flex w-full flex-row items-center gap-3 rounded-t-lg border-0 border-[#e5e7eb] px-3 py-2"
				class:rounded-t-lg={isFirst(mockEntries, index)}
				class:rounded-b-lg={isLast(mockEntries, index)}
			>
				<input
					name="shipping-method"
					disabled={true}
					class="text-fy-on-primary-subtle bg-fy-on-primary-subtle animate-pulse border-0"
					type="radio"
					checked={false}
				/>
				<div class="grow">
					<span class="block font-bold">
						<div class="bg-fy-on-primary-subtle my-2 h-3 w-1/2 animate-pulse rounded"></div>
					</span>
					<span class="block text-sm">
						<div class="bg-fy-on-primary-subtle my-2 h-3 w-2/3 animate-pulse rounded"></div>
					</span>
				</div>
				<span class="font-bold">
					<div class="bg-fy-on-primary-subtle my-2 h-3 w-12 animate-pulse rounded"></div>
				</span>
			</label>
		{/each}
	{:else}
		{#each shippingMethods as shippingMethod, index (shippingMethod.sku)}
			<label
				class="col-span-2 flex w-full flex-row items-center gap-3 border-0 px-3 py-3"
				class:group-item-custom-bg={disabled && selectedShippingMethod !== shippingMethod.sku}
				class:rounded-t-lg={isFirst(shippingMethods, index)}
				class:rounded-b-lg={isLast(shippingMethods, index)}
			>
				<input
					name="shipping-method"
					class="text-fy-action disabled:text-fy-on-primary-subtle"
					type="radio"
					disabled={inProgress || (disabled && selectedShippingMethod !== shippingMethod.sku)}
					value={shippingMethod.sku}
					checked={selectedShippingMethod === shippingMethod.sku}
					on:change={onChange}
				/>
				<div>
					<span
						class="block text-sm font-bold"
						class:text-fy-on-surface-subtle={disabled &&
							selectedShippingMethod !== shippingMethod.sku}
					>
						{#if inProgress}
							<div class="bg-fy-on-primary-subtle my-2 h-3 w-32 animate-pulse rounded"></div>
						{:else}
							{shippingMethod.description}
						{/if}
					</span>
					{#if shippingMethod.estimated_delivery}
						<span class="text-fy-on-surface-subtle block text-sm">
							{#if inProgress}
								<div class="bg-fy-on-primary-subtle my-2 h-3 w-64 animate-pulse rounded"></div>
							{:else}
								{shippingMethod.estimated_delivery}
							{/if}
						</span>
					{/if}
				</div>
				<div class="grow" />
				<span
					class="text-sm font-bold"
					class:text-fy-on-surface-subtle={disabled &&
						selectedShippingMethod !== shippingMethod.sku}
				>
					{#if inProgress}
						<div class="bg-fy-on-primary-subtle my-2 h-3 w-12 animate-pulse rounded"></div>
					{:else}
						{shippingMethod.price.value === 0 ? 'Free' : formatCurrency(shippingMethod.price)}
					{/if}
				</span>
			</label>
		{/each}
	{/if}
</Group>

<style>
	input[type='radio']:focus {
		box-shadow: none;
	}

	.group-item-custom-bg {
		background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
		box-shadow: var(--fy-surface-box-shadow);
	}
</style>
