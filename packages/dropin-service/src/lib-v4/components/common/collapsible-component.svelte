<script>
	import { createEventDispatcher } from 'svelte';
	export let disabled = false;
	export let collapsed = true;

	const dispatch = createEventDispatcher();

	function expandForm() {
		dispatch('expand');
	}
</script>

<div>
	<div class="flex justify-between items-start">
		{#if collapsed}
			<slot name="collapsed" />
			<button {disabled} on:click={expandForm} class="text-blue-500 hover:underline mt-6 mr-4"
				>Edit</button
			>
		{:else}
			<slot name="expanded" />
		{/if}
	</div>
</div>
