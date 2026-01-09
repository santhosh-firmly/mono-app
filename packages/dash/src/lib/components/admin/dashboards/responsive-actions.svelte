<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import MoreHorizontal from 'lucide-svelte/icons/more-horizontal';

	/**
	 * @typedef {Object} Action
	 * @property {string} id - Unique identifier
	 * @property {any} icon - Lucide icon component
	 * @property {string} label - Button label/tooltip text
	 * @property {string} [variant] - Button variant (default, outline, ghost, destructive)
	 * @property {string} [class] - Additional CSS classes
	 * @property {string} [href] - Link URL (makes button a link)
	 * @property {string} [target] - Link target (_blank, etc)
	 * @property {Function} [onclick] - Click handler
	 */

	let {
		/** @type {Action[]} */
		actions = []
	} = $props();

	// Constants for measurement (no gaps in toolbar style)
	const BUTTON_WIDTH = 32; // icon button width
	const DROPDOWN_WIDTH = 32; // dropdown trigger width

	let containerRef = $state(null);
	let visibleCount = $state(actions.length); // Default to showing all

	$effect(() => {
		if (!containerRef || typeof window === 'undefined') return;

		const calculateVisibleCount = () => {
			const containerWidth = containerRef.offsetWidth;
			const actionCount = actions.length;

			if (actionCount <= 1) {
				visibleCount = actionCount;
				return;
			}

			// Calculate width needed to show all buttons (no gaps in toolbar)
			const allFitWidth = actionCount * BUTTON_WIDTH;

			// If all fit, show all
			if (allFitWidth <= containerWidth) {
				visibleCount = actionCount;
				return;
			}

			// Calculate how many buttons fit when we need to show dropdown
			const availableWidth = containerWidth - DROPDOWN_WIDTH;
			const maxVisible = Math.floor(availableWidth / BUTTON_WIDTH);

			visibleCount = Math.max(1, Math.min(maxVisible, actionCount - 1));
		};

		const observer = new ResizeObserver(() => {
			calculateVisibleCount();
		});

		observer.observe(containerRef);
		calculateVisibleCount(); // Initial calculation

		return () => observer.disconnect();
	});

	// Recalculate when actions change
	$effect(() => {
		// Trigger recalculation when actions array changes
		void actions.length;
		if (containerRef) {
			visibleCount = Math.min(visibleCount, actions.length);
		}
	});

	let visibleActions = $derived(actions.slice(0, visibleCount));
	let overflowActions = $derived(actions.slice(visibleCount));
	let hasOverflow = $derived(overflowActions.length > 0);

	function getButtonClasses(index, actionClass = '') {
		const isFirst = index === 0;
		const isLast = !hasOverflow && index === visibleActions.length - 1;

		let classes = 'h-8 w-8 rounded-none border-0 bg-muted hover:bg-muted-foreground/20';

		if (isFirst) {
			classes += ' rounded-l-md';
		}
		if (isLast) {
			classes += ' rounded-r-md';
		}

		if (actionClass) {
			classes += ' ' + actionClass;
		}

		return classes;
	}
</script>

<div bind:this={containerRef} class="flex items-center justify-end">
	<div class="inline-flex rounded-md shadow-sm">
		{#each visibleActions as action, index (action.id)}
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#if action.href}
						<Button
							variant="ghost"
							size="icon"
							class={getButtonClasses(index, action.class)}
							href={action.href}
							target={action.target}
						>
							<action.icon class="h-4 w-4" />
							<span class="sr-only">{action.label}</span>
						</Button>
					{:else}
						<Button
							variant="ghost"
							size="icon"
							class={getButtonClasses(index, action.class)}
							onclick={action.onclick}
						>
							<action.icon class="h-4 w-4" />
							<span class="sr-only">{action.label}</span>
						</Button>
					{/if}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom">{action.label}</Tooltip.Content>
			</Tooltip.Root>
		{/each}

		{#if hasOverflow}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 rounded-none rounded-r-md border-0 bg-muted hover:bg-muted-foreground/20"
					>
						<MoreHorizontal class="h-4 w-4" />
						<span class="sr-only">More actions</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					{#each overflowActions as action (action.id)}
						{#if action.href}
							<DropdownMenu.Item href={action.href} target={action.target}>
								<action.icon class="mr-2 h-4 w-4" />
								{action.label}
							</DropdownMenu.Item>
						{:else}
							<DropdownMenu.Item onclick={action.onclick}>
								<action.icon class="mr-2 h-4 w-4" />
								{action.label}
							</DropdownMenu.Item>
						{/if}
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</div>
</div>
