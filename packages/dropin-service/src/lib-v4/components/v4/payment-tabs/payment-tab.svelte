<script>
	// @ts-nocheck

	export let text;
	export let active;
	export let disabled;
</script>

<button
	on:click
	type="button"
	class="bg-fy-surface border-fy-on-surface flex w-20 min-w-[80px] flex-col justify-between rounded-lg border px-3 py-2 hover:opacity-100 hover:shadow-lg"
	class:shadow-lg={active}
	class:opacity-50={!active}
	{disabled}
>
	<slot />
	<span class="text-fy-on-surface pt-1 text-left text-xs leading-none">{text}</span>
</button>
