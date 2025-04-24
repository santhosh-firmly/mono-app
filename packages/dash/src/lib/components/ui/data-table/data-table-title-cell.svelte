<script>
	import { Badge } from '$lib/components/ui/badge/index.js';

	export let value;
	export let labelValue;
	// const label = labels.find((label) => label.value === labelValue);
	const label = null;
</script>

<div class="flex space-x-2">
	{#if label}
		<Badge variant="outline">{label.label}</Badge>
	{/if}
	<span class="max-w-[500px] truncate font-medium">
		{value}
	</span>
</div>
