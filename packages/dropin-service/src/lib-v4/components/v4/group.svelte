<script>
	export let stretch = true;
	export let grid = true;
</script>

<div
	data-testid="group"
	class="text-fy-on-surface rounded-lg"
	class:w-full={stretch}
	class:grid
	class:grid-cols-2={grid}
>
	<slot />
</div>

<style>
	div > :global(*) {
		background-color: var(--fy-surface);
		box-shadow: var(--fy-surface-box-shadow);
	}
</style>
