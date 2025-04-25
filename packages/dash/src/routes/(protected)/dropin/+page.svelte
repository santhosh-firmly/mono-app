<script>
	import Rabbit from 'lucide-svelte/icons/rabbit';
	import Bird from 'lucide-svelte/icons/bird';
	import Turtle from 'lucide-svelte/icons/turtle';

	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import BlockToolbar from '$lib/components/custom/block-toolbar.svelte';

	let resizablePaneRef;
	// let block;

	let isLoading = false;
</script>

<main class="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
	<div class="relative hidden flex-col items-start gap-8 pt-[30px] md:flex">
		<form class="grid w-full items-start gap-6">
			<fieldset class="grid gap-6 rounded-lg border bg-white/50 p-4">
				<legend class="-ml-1 px-1 text-sm font-medium"> Settings </legend>
				<div class="grid gap-3">
					<Label for="model">Model</Label>
					<Select.Root>
						<Select.Trigger
							id="model"
							class="items-start [&_[data-description]]:hidden"
						>
							<Select.Value placeholder="Select a model" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="genesis">
								<div class="flex items-start gap-3 text-muted-foreground">
									<Rabbit class="size-5" />
									<div class="grid gap-0.5">
										<p>
											Neural
											<span class="font-medium text-foreground">
												Genesis
											</span>
										</p>
										<p class="text-xs" data-description>
											Our fastest model for general use cases.
										</p>
									</div>
								</div>
							</Select.Item>
							<Select.Item value="explorer">
								<div class="flex items-start gap-3 text-muted-foreground">
									<Bird class="size-5" />
									<div class="grid gap-0.5">
										<p>
											Neural
											<span class="font-medium text-foreground">
												Explorer
											</span>
										</p>
										<p class="text-xs" data-description>
											Performance and speed for efficiency.
										</p>
									</div>
								</div>
							</Select.Item>
							<Select.Item value="quantum">
								<div class="flex items-start gap-3 text-muted-foreground">
									<Turtle class="size-5" />
									<div class="grid gap-0.5">
										<p>
											Neural
											<span class="font-medium text-foreground">
												Quantum
											</span>
										</p>
										<p class="text-xs" data-description>
											The most powerful model for complex computations.
										</p>
									</div>
								</div>
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-3">
					<Label for="temperature">Temperature</Label>
					<Input id="temperature" type="number" placeholder="0.4" />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-3">
						<Label for="top-p">Top P</Label>
						<Input id="top-p" type="number" placeholder="0.7" />
					</div>
					<div class="grid gap-3">
						<Label for="top-k">Top K</Label>
						<Input id="top-k" type="number" placeholder="0.0" />
					</div>
				</div>
			</fieldset>
			<fieldset class="grid gap-6 rounded-lg border p-4">
				<legend class="-ml-1 px-1 text-sm font-medium"> Messages </legend>
				<div class="grid gap-3">
					<Label for="role">Role</Label>
					<Select.Root selected={{ value: 'system', label: 'system' }}>
						<Select.Trigger>
							<Select.Value placeholder="Select a role" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="system">System</Select.Item>
							<Select.Item value="user">User</Select.Item>
							<Select.Item value="assistant">Assistant</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-3">
					<Label for="content">Content</Label>
					<Textarea id="content" placeholder="You are a..." class="min-h-[9.5rem]" />
				</div>
			</fieldset>
		</form>
	</div>
	<div class="relative flex h-full min-h-[50vh] flex-col items-center gap-3 lg:col-span-2">
		<BlockToolbar {resizablePaneRef} />
		<Resizable.PaneGroup direction="horizontal" class="relative z-10 ">
			<Resizable.Pane
				bind:pane={resizablePaneRef}
				class="relative rounded-lg border border-border bg-background"
				defaultSize={100}
				minSize={30}
			>
				{#if isLoading}
					<div
						class="absolute inset-0 z-10 flex h-[--container-height] w-full items-center justify-center gap-2 text-sm text-muted-foreground"
					>
						<!-- <Icons.spinner class="h-4 w-4 animate-spin" /> -->
						Loading...
					</div>
				{/if}
				<iframe
					src="https://dropin.firmly.live/single-page"
					class="chunk-mode relative z-20 h-full w-full rounded-xl bg-background shadow-lg"
					on:load={() => {
						isLoading = false;
					}}
					title="Block preview"
				></iframe>
			</Resizable.Pane>
			<Resizable.Handle
				class="relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:translate-x-[-1px] after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block"
			/>
			<Resizable.Pane defaultSize={0} minSize={0} />
		</Resizable.PaneGroup>
	</div>
</main>
