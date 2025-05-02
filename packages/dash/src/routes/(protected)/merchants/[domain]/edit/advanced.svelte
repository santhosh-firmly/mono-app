<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Save, AlertTriangle } from 'lucide-svelte';

	let { merchant, saveMerchant } = $props();

	let isSubmitting = $state(false);
	let isEditable = $state(false);
	let configValue = $state(JSON.stringify(merchant, null, 2));

	async function handleSave() {
		isSubmitting = true;
		try {
			if (isEditable) {
				try {
					JSON.parse(configValue);
				} catch {
					alert('Invalid JSON configuration. Please check your syntax.');
					return;
				}
			}
			await saveMerchant();
		} finally {
			isSubmitting = false;
		}
	}

	$effect(() => {
		configValue = JSON.stringify(merchant, null, 2);
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

	<Card.Root>
		<Card.Header>
			<Card.Title>Raw Configuration</Card.Title>
			<Card.Description>View the complete merchant configuration</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div>
				<div class="flex items-center justify-between">
					<Label for="raw_config" class="text-sm font-medium">Configuration JSON</Label>
					<div class="flex items-center space-x-2">
						<Checkbox id="editable-toggle" on:click={(isEditable = !isEditable)} />
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
						<span class="font-semibold text-amber-500">CAUTION: Edit mode enabled.</span
						>
						Changes to this configuration will be applied when you save. Ensure valid JSON
						format.
					{:else}
						This is the complete configuration for this merchant. For safety, this view
						is read-only. Check "Enable editing" to make changes.
					{/if}
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Save Button -->
	<div class="flex justify-end pt-6">
		<Button on:click={handleSave} disabled={isSubmitting} class="flex items-center gap-2">
			<Save class="h-4 w-4" />
			Save Changes
		</Button>
	</div>
</div>
