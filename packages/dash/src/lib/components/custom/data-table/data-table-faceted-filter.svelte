<script>
	import PlusCircled from 'svelte-radix/PlusCircled.svelte';
	import Check from 'svelte-radix/Check.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { selectedOptions = $bindable(), title, options = [], counts = {} } = $props();

	let open = $state(false);
	let searchCriteria = $state('');

	function handleSelect(currentValue) {
		if (Array.isArray(selectedOptions) && selectedOptions?.includes(currentValue)) {
			selectedOptions = selectedOptions?.filter((v) => v !== currentValue);
		} else {
			selectedOptions = [
				...(Array.isArray(selectedOptions) ? selectedOptions : []),
				currentValue
			];
		}
	}

	$effect(() => {
		if (!open) searchCriteria = '';
	});

	let filteredOptions = $derived.by(() => {
		if (!searchCriteria) {
			return options;
		}

		return options.filter((option) => {
			return option.toLowerCase().includes(searchCriteria.toLowerCase());
		});
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button variant="outline" size="sm" class="h-8 border-dashed">
			<PlusCircled class="mr-2 h-4 w-4" />
			{title}

			{#if selectedOptions?.length > 0}
				<Separator orientation="vertical" class="mx-2 h-4" />
				<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
					{selectedOptions?.length}
				</Badge>
				<div class="hidden space-x-1 lg:flex">
					{#if selectedOptions?.length > 2}
						<Badge variant="secondary" class="rounded-sm px-1 font-normal">
							{selectedOptions?.length} Selected
						</Badge>
					{:else}
						{#each selectedOptions as option (option)}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								{option}
							</Badge>
						{/each}
					{/if}
				</div>
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0" align="start" side="bottom">
		<Command.Root>
			<Command.Input placeholder={title} bind:value={searchCriteria} />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				{#key searchCriteria}
					<Command.Group>
						{#each filteredOptions as value (value)}
							<Command.Item
								{value}
								onSelect={(currentValue) => {
									handleSelect(currentValue);
								}}
							>
								<div
									class={[
										'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
										selectedOptions?.includes(value)
											? 'bg-primary text-primary-foreground'
											: 'opacity-50 [&_svg]:invisible'
									]}
								>
									<Check class="h-4 w-4" />
								</div>
								<span>
									{value}
								</span>
								{#if counts[value]}
									<span
										class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs"
									>
										{counts[value]}
									</span>
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				{/key}
				{#if selectedOptions?.length > 0}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => {
							selectedOptions = [];
						}}
					>
						Clear filters
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
