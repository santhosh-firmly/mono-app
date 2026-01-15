<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';

	const PREDEFINED_CATEGORIES = ['AI Shopping Agents & LLMs', 'Publishers', 'CTV', 'Social'];

	let {
		value = '',
		customCategories = [],
		onSelect,
		placeholder = 'Select or type category...'
	} = $props();

	let isOpen = $state(false);
	let searchCriteria = $state('');

	// Combine predefined + custom categories, deduplicated and sorted
	let allOptions = $derived(() => {
		const combined = new Set([...PREDEFINED_CATEGORIES, ...customCategories]);
		return [...combined].sort((a, b) => a.localeCompare(b));
	});

	// Filter options based on search criteria
	let filteredOptions = $derived(() => {
		if (!searchCriteria.trim()) return allOptions();
		return allOptions().filter((opt) =>
			opt.toLowerCase().includes(searchCriteria.toLowerCase())
		);
	});

	// Show option to add custom category if typed value doesn't match existing options
	let showCustomOption = $derived(() => {
		const trimmed = searchCriteria.trim();
		if (!trimmed) return false;
		return !allOptions().some((opt) => opt.toLowerCase() === trimmed.toLowerCase());
	});

	async function handleSelect(selectedValue) {
		onSelect?.(selectedValue);
		searchCriteria = '';
		isOpen = false;
		await tick();
	}

	async function handleCustomSelect() {
		const trimmed = searchCriteria.trim();
		if (trimmed) {
			onSelect?.(trimmed);
			searchCriteria = '';
			isOpen = false;
			await tick();
		}
	}

	function handleClear() {
		onSelect?.('');
		searchCriteria = '';
		isOpen = false;
	}
</script>

<div class="relative w-full">
	<Popover.Root bind:open={isOpen}>
		<Popover.Trigger>
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={isOpen}
				class="w-full justify-between"
			>
				{value || placeholder}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-[300px] p-0">
			<Command.Root>
				<Command.Input placeholder="Search or type custom..." bind:value={searchCriteria} />
				<Command.Empty>
					{#if showCustomOption()}
						<button
							type="button"
							class="w-full px-2 py-1.5 text-left text-sm hover:bg-accent cursor-pointer"
							onclick={handleCustomSelect}
						>
							Add "{searchCriteria.trim()}"
						</button>
					{:else}
						No category found.
					{/if}
				</Command.Empty>
				{#key searchCriteria}
					<Command.Group class="max-h-[200px] overflow-y-auto">
						{#if value}
							<Command.Item value="" onSelect={() => handleClear()}>
								<span class="text-muted-foreground">Clear selection</span>
							</Command.Item>
						{/if}
						{#each filteredOptions() as option (option)}
							<Command.Item value={option} onSelect={() => handleSelect(option)}>
								<Check
									class={cn(
										'mr-2 h-4 w-4',
										option !== value && 'text-transparent'
									)}
								/>
								{option}
							</Command.Item>
						{/each}
						{#if showCustomOption()}
							<Command.Item
								value={searchCriteria.trim()}
								onSelect={handleCustomSelect}
							>
								<span class="text-primary">+ Add "{searchCriteria.trim()}"</span>
							</Command.Item>
						{/if}
					</Command.Group>
				{/key}
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
