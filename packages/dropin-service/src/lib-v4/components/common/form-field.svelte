<script>
	// @ts-nocheck
	import FloatingLabelInput from '$lib-v4/components/vendor/floating-label-input.svelte';
	import Helper from '$lib-v4/components/vendor/helper.svelte';

	import { getContext } from 'svelte';

	export let key = Symbol();
	let context = getContext(key);
	const { handleChange, form, errors } = context;

	export let id = '';
	export let input;
</script>

<div class="flex w-full flex-col">
	<FloatingLabelInput
		style="outlined"
		{id}
		name={id}
		on:change={handleChange}
		on:keyup={handleChange}
		on:blur={handleChange}
		bind:value={$form[id]}
		bind:input
		{...$$restProps}
	/>
	{#if $errors[id]}
		<Helper
			color="red"
			helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-end pr-2"
			>{$errors[id]}</Helper
		>
	{/if}
</div>
