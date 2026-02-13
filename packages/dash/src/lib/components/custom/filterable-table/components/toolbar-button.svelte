<script>
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	const { tooltipText, children, onclick, active, separator = true, disabled = false } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root delayDuration={200}>
		<Tooltip.Trigger
			class="flex flex-row items-center gap-1 !px-2 !py-1.5 text-sm transition-all {disabled
				? 'opacity-40 cursor-not-allowed'
				: 'cursor-pointer hover:scale-110 hover:text-purple-500 hover:shadow-lg dark:hover:text-purple-400'} {active
				? 'text-purple-500 dark:text-purple-400'
				: 'text-slate-500 dark:text-gray-400'} {separator
				? 'border-r border-l border-gray-100 dark:border-gray-700'
				: ''}"
			onclick={disabled ? undefined : onclick}
		>
			{@render children()}
		</Tooltip.Trigger>
		<Tooltip.Content sideOffset={8}>
			{tooltipText}
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
