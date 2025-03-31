<script>
	// @ts-nocheck

	export let text;
	export let active;
	export let disabled;
</script>

<button
	on:click
	type="button"
	class="w-20 min-w-[80px] py-2 px-3 border rounded-lg bg-fy-surface border-fy-on-surface hover:opacity-100 hover:shadow-lg flex flex-col justify-between"
	class:shadow-lg={active}
	class:opacity-50={!active}
	{disabled}
>
	<slot />
	<span class="pt-1 leading-none text-left text-xs text-fy-on-surface">{text}</span>
</button>
