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
	<div class="flex items-start justify-between">
		{#if collapsed}
			<slot name="collapsed" />
			<button {disabled} on:click={expandForm} class="mt-6 mr-4 text-blue-500 hover:underline"
				>Edit</button
			>
		{:else}
			<slot name="expanded" />
		{/if}
	</div>
</div>
