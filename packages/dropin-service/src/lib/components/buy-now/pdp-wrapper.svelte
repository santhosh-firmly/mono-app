<script>
	import Header from './header.svelte';
	import PoweredBy from '$lib/components/ui/firmly-powered.svelte';

	let { presentation = null, onBackClick = () => {}, children } = $props();
</script>

<div class="flex h-full w-full flex-col">
	<Header {presentation} {onBackClick} />
	<div class="flex-1 overflow-auto">
		{@render children?.()}
	</div>
	<div class="flex items-center justify-center border-t border-border py-2">
		<PoweredBy />
	</div>
</div>
