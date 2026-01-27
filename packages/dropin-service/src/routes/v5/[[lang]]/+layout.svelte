<script>
	import { setLanguageTag } from '$lib/paraglide/runtime';

	let { data, children } = $props();

	$effect(() => {
		setLanguageTag(data.lang);
	});
</script>

{@render children()}
