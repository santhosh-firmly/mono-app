<script>
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { AlertTriangle, Code } from 'lucide-svelte';
	import FeatureCard from '$lib/components/custom/feature-card.svelte';

	let { merchant } = $props();

	let isEditable = $state(false);

	let configValue = $state.raw(JSON.stringify(merchant, null, 2));

	function applyJsonChanges() {
		if (isEditable) {
			try {
				const parsed = JSON.parse(configValue);
				Object.assign(merchant, parsed);
			} catch {
				alert('Invalid JSON configuration. Please check your syntax.');
			}
		}
	}

	$effect(() => {
		configValue = JSON.stringify(merchant, null, 2);
	});

	$effect(() => {
		if (isEditable && configValue) {
			try {
				JSON.parse(configValue);
			} catch (e) {
				console.error('Error when parse JSON', e);
			}
		}
	});
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-2xl font-semibold tracking-tight">Advanced Settings</h2>
		<p class="mt-2 text-muted-foreground">Technical configuration options for this merchant.</p>
	</div>

	<div class="my-8 border-t border-border"></div>

	<Alert.Root variant="destructive">
		<AlertTriangle class="mr-2 h-4 w-4" />
		<Alert.Title>Exercise caution</Alert.Title>
		<Alert.Description>
			Changes to these settings may affect the merchant's functionality and could result in
			service disruption. Please ensure you understand the implications before making changes.
		</Alert.Description>
	</Alert.Root>

	<FeatureCard
		title="Raw Configuration"
		description="View the complete merchant configuration"
		icon={Code}
	>
		<div>
			<div class="flex items-center justify-between">
				<Label for="raw_config" class="text-sm font-medium">Configuration JSON</Label>
				<div class="flex items-center space-x-2">
					<Checkbox
						id="editable-toggle"
						on:click={() => {
							isEditable = !isEditable;
							if (!isEditable) {
								applyJsonChanges();
							}
						}}
					/>
					<label
						for="editable-toggle"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Enable editing
					</label>
				</div>
			</div>
			<textarea
				id="raw_config"
				class="mt-2 h-64 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={configValue}
				readonly={!isEditable}
				class:border-amber-500={isEditable}
			></textarea>
			<p class="mt-2 text-xs text-muted-foreground">
				{#if isEditable}
					<span class="font-semibold text-amber-500">CAUTION: Edit mode enabled.</span>
					Changes to this configuration will be applied when you save. Ensure valid JSON format.
				{:else}
					This is the complete configuration for this merchant. For safety, this view is
					read-only. Check "Enable editing" to make changes.
				{/if}
			</p>
		</div>
	</FeatureCard>
</div>
