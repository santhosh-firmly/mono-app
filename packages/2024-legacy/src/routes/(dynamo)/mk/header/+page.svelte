<script>
	import Header from '$lib/components/mk/header.svelte';
	import { onMount } from 'svelte';

	let showCartButton = false;

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		showCartButton = !!searchParams.get('showCartButton');
	});
</script>

<Header alwaysStickySearchBar={true} {showCartButton} />
