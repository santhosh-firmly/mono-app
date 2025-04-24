<script>
	import PlusCircled from 'svelte-radix/PlusCircled.svelte';
	// import Check from 'svelte-radix/Check.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	export let filterValues = [];
	export let title;
	export let options = [];
	export let counts = {};

	let open = false;

	function handleSelect(currentValue) {
		if (Array.isArray(filterValues) && filterValues.includes(currentValue)) {
			filterValues = filterValues.filter((v) => v !== currentValue);
		} else {
			filterValues = [...(Array.isArray(filterValues) ? filterValues : []), currentValue];
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="sm" class="h-8 border-dashed">
			<PlusCircled class="mr-2 h-4 w-4" />
			{title}

			{#if filterValues.length > 0}
				<Separator orientation="vertical" class="mx-2 h-4" />
				<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
					{filterValues.length}
				</Badge>
				<div class="hidden space-x-1 lg:flex">
					{#if filterValues.length > 2}
						<Badge variant="secondary" class="rounded-sm px-1 font-normal">
							{filterValues.length} Selected
						</Badge>
					{:else}
						{#each filterValues as option (option)}
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
			<Command.Input placeholder={title} />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					{#each options as option, index (index)}
						{@const Icon = option.icon}
						{@const value = option.value || option}
						{@const label = option.label || option}
						<Command.Item
							{value}
							onSelect={(currentValue) => {
								handleSelect(currentValue);
							}}
						>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									filterValues.includes(value)
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<!-- <Check className={cn('h-4 w-4')} /> -->
							</div>
							{#if Icon}
								<Icon class="mr-2 h-4 w-4 text-muted-foreground" />
							{/if}
							<span>
								{label || '(Blank)'}
							</span>
							{#if counts[value]}
								<span class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
									{counts[value]}
								</span>
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
				{#if filterValues.length > 0}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => {
							filterValues = [];
						}}
					>
						Clear filters
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
