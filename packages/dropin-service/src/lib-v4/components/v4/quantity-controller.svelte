<script>
	// @ts-nocheck
	import { debounce } from '$lib-v4/browser/dash.js';
	import Group from './group.svelte';

	const MAX_QUANTITY_ALLOWED = 50;
	const MIN_QUANTITY_ALLOWED = 0;

	export let quantity;
	export let disabled;
	let inputFieldValue = quantity;

	$: {
		inputFieldValue = quantity;
	}

	export let updateItemQuantityImmediately;

	const qtyDebounce = debounce(updateItemQuantityImmediately, 500);

	const updateItemQuantity = async (qty) => {
		quantity = Math.min(MAX_QUANTITY_ALLOWED, qty);
		quantity = Math.max(MIN_QUANTITY_ALLOWED, quantity);
		inputFieldValue = quantity;
		qtyDebounce(quantity);
	};
</script>

<div class="mt-3 flex flex-row items-center">
	<Group stretch={false}>
		<div
			class="col-span-2 container flex flex-row items-center overflow-hidden rounded-lg"
			class:bg-gray-100={disabled}
		>
			<button
				class="h-full w-8 p-1 px-2 text-xs font-bold hover:bg-gray-100 disabled:bg-gray-100"
				type="button"
				{disabled}
				on:click={() => updateItemQuantity(--quantity)}
				data-testid="decrease-quantity"
			>
				{#if quantity <= 1}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						x="0px"
						y="0px"
						width="16"
						height="16"
						viewBox="0 0 30 30"
					>
						<path
							d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z"
						></path>
					</svg>
				{:else}
					-
				{/if}
			</button>
			<input
				class="w-6 text-center text-xs disabled:bg-gray-100"
				{disabled}
				bind:value={inputFieldValue}
				data-testid="quantity-input"
				on:change={(ev) => {
					updateItemQuantityImmediately(Math.min(ev.target.value, MAX_QUANTITY_ALLOWED));
				}}
			/>
			<button
				class="text w-8 p-1 px-2 text-xs font-bold hover:bg-gray-100 disabled:bg-gray-100"
				type="button"
				{disabled}
				data-testid="increase-quantity"
				on:click={() => updateItemQuantity(++quantity)}
			>
				+
			</button>
		</div>
	</Group>
</div>

<style>
	.container,
	.container * {
		transition: background 0.25s ease;
	}
</style>
