<script>
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';

	// Using $props rune for component properties
	let {
		items = [],
		activeSection = '',
		onSectionChange = (section) => {},
		className = ''
	} = $props();

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<nav class={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}>
	{#each items as item (item.id)}
		{@const isActive = activeSection === item.id}

		<Button
			variant="ghost"
			class={cn('relative justify-start', isActive ? 'bg-muted font-medium' : 'hover:bg-muted/50')}
			on:click={() => onSectionChange(item.id)}
		>
			{#if isActive}
				<div
					class="absolute inset-0 rounded-md bg-muted"
					in:send={{ key: 'active-sidebar-tab' }}
					out:receive={{ key: 'active-sidebar-tab' }}
				></div>
			{/if}
			<div class="relative">
				{item.title}
			</div>
		</Button>
	{/each}
</nav>
