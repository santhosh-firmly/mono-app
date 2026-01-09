<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';

	let { value = '', options = [], onSelect, placeholder = 'Select option...' } = $props();
	let isOpen = $state(false);

	let searchCriteria = $state('');
	let selected = $derived(options.find((option) => option.value === value));

	async function handleSelect(selectedValue) {
		onSelect?.(selectedValue);
		isOpen = false;
		await tick();
	}

	let optionsFiltered = $derived(
		options.filter((option) =>
			option.label?.toLowerCase().includes(searchCriteria?.toLowerCase())
		)
	);
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
				{selected?.label ?? placeholder}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-fit p-0">
			<Command.Root>
				<Command.Input placeholder="Search..." bind:value={searchCriteria} />
				<Command.Empty>No option found.</Command.Empty>
				{#key searchCriteria}
					<Command.Group class="max-h-[200px] overflow-y-auto">
						{#each optionsFiltered as option (option.label)}
							<Command.Item
								value={option.value}
								onSelect={(currentValue) => handleSelect(currentValue)}
							>
								<Check
									class={cn(
										'mr-2 h-4 w-4',
										option.value !== value && 'text-transparent'
									)}
								/>
								{option.label}
							</Command.Item>
						{/each}
					</Command.Group>
				{/key}
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
