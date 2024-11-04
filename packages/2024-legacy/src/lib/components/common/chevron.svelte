<script>
	// @ts-nocheck
	import ChevronDownIcon from './svg/chevron-down-icon.svelte';
	import ChevronUpIcon from './svg/chevron-up-icon.svelte';

	export let onClick;
	export let isOpen = false;

	function onClickHandler() {
		isOpen = !isOpen;
		if (onClick) {
			onClick(isOpen);
		}
	}
</script>

<button on:click={onClickHandler}>
	{#if isOpen}
		<ChevronUpIcon {...$$restProps} />
	{:else}
		<ChevronDownIcon {...$$restProps} />
	{/if}
</button>
