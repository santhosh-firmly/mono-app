<script lang="ts">
	import Monitor from 'lucide-svelte/icons/monitor';
	import Smartphone from 'lucide-svelte/icons/smartphone';
	import Tablet from 'lucide-svelte/icons/tablet';

	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';

	export let resizablePaneRef;
</script>

<div
	class="hidden h-[28px] items-center gap-1.5 rounded-md border bg-background p-[2px] shadow-sm md:flex"
>
	<ToggleGroup.Root
		type="single"
		value="100"
		onValueChange={(value) => {
			if (resizablePaneRef && value !== undefined) {
				resizablePaneRef.resize(Number.parseInt(value));
			}
		}}
	>
		<ToggleGroup.Item value="100" class="h-[22px] w-[22px] rounded-sm p-0">
			<Monitor class="h-3.5 w-3.5" />
		</ToggleGroup.Item>
		<ToggleGroup.Item value="60" class="h-[22px] w-[22px] rounded-sm p-0">
			<Tablet class="h-3.5 w-3.5" />
		</ToggleGroup.Item>
		<ToggleGroup.Item value="30" class="h-[22px] w-[22px] rounded-sm p-0">
			<Smartphone class="h-3.5 w-3.5" />
		</ToggleGroup.Item>
	</ToggleGroup.Root>
</div>
