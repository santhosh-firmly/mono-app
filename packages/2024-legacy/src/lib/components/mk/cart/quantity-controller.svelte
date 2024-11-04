<script>
	// @ts-nocheck
	import { debounce } from '$lib/browser/dash.js';
	import { sApiDynamoProgress } from '$lib/browser/api-manager.js';

	const MAX_QUANTITY_ALLOWED = 50;

	export let item;
	let quantity = item.quantity;
	let inputFieldValue = quantity;

	$: {
		quantity = item.quantity;
		inputFieldValue = item.quantity;
	}

	async function updateItemQuantityImmediately(item, quantity) {
		sApiDynamoProgress.set(true);
		try {
			await item.updateQuantity(quantity);
			inputFieldValue = quantity;
		} finally {
			sApiDynamoProgress.set(false);
		}
	}

	const qtyDebounce = debounce(updateItemQuantityImmediately, 500);

	const updateItemQuantity = async (item, qty) => {
		quantity = Math.min(MAX_QUANTITY_ALLOWED, qty);
		quantity = Math.max(1, quantity);
		inputFieldValue = quantity;
		qtyDebounce(item, quantity);
	};
</script>

<div class="flex flex-row items-center mt-3 container">
	<div
		class="border-solid rounded-full overflow-hidden border-2 border-gray-200 {$sApiDynamoProgress
			? 'bg-gray-200'
			: ''}"
	>
		<button
			class="px-2 disabled:bg-gray-200 hover:bg-gray-100"
			disabled={$sApiDynamoProgress}
			on:click={() => updateItemQuantity(item, --quantity)}
		>
			-
		</button>
		<input
			class="w-6 text-center disabled:bg-gray-200"
			disabled={$sApiDynamoProgress}
			value={inputFieldValue}
			on:change={(ev) => {
				updateItemQuantityImmediately(item, Math.min(ev.target.value, MAX_QUANTITY_ALLOWED));
			}}
		/>
		<button
			class="px-2 disabled:bg-gray-200 hover:bg-gray-100"
			disabled={$sApiDynamoProgress}
			on:click={() => updateItemQuantity(item, ++quantity)}
		>
			+
		</button>
	</div>
	<div class="flex flex-row justify-center align-center grow" />
	<button
		class="underline text-xs px-2"
		on:click={updateItemQuantityImmediately(item, 0)}
		disabled={$sApiDynamoProgress}>Remove</button
	>
</div>

<style>
	.container * {
		transition: background 0.25s ease;
	}
</style>
