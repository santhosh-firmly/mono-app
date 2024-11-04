<script lang="ts">
	import Header from '$lib/components/mk/header.svelte';
	import CartDrawer from '$lib/components/mk/cart/cart-drawer.svelte';
	import Categories from '$lib/components/mk/categories.svelte';
	import StoresMasonry from '$lib/components/mk/stores-masonry.svelte';
	import { sCartHive } from '$lib/browser/storage.js';

	let category: string | null;
</script>

<Header showCartButton={true} />
<CartDrawer cartHive={$sCartHive} />
<Categories on:categoryChange={(e) => (category = e.detail)} />
<StoresMasonry {category} />
