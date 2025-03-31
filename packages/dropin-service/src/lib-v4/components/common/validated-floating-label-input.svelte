<script>
	import FloatingLabelInput from '../vendor/floating-label-input.svelte';
	import Helper from '../vendor/helper.svelte';

	export let style = 'outlined';
	export let label = '';
	export let autocomplete = '';
	export let value = '';
	export let errorMessage = '';
	export let id = '';
</script>

<div>
	<FloatingLabelInput name={id} {id} {style} {label} {autocomplete} bind:value on:change />
	{#if errorMessage}
		<Helper
			color="red"
			helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-end pr-2"
			>{errorMessage}</Helper
		>
	{/if}
</div>
