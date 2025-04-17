<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Save, AlertTriangle } from 'lucide-svelte';

	// Using $props rune for component properties
	let { merchant, saveMerchant } = $props();

	// Track state
	let isSubmitting = $state(false);

	// Handle save with loading state
	async function handleSave() {
		isSubmitting = true;
		try {
			await saveMerchant();
		} finally {
			isSubmitting = false;
		}
	}
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
			Changes to these settings may affect the merchant's functionality and could result in service
			disruption. Please ensure you understand the implications before making changes.
		</Alert.Description>
	</Alert.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Raw Configuration</Card.Title>
			<Card.Description>View the complete merchant configuration</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div>
				<Label for="raw_config" class="text-sm font-medium">Configuration JSON</Label>
				<textarea
					id="raw_config"
					class="mt-2 h-64 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					value={JSON.stringify(merchant, null, 2)}
					readonly
				></textarea>
				<p class="mt-2 text-xs text-muted-foreground">
					This is the complete configuration for this merchant. For safety, this view is read-only.
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Save Button -->
	<div class="flex justify-end pt-6">
		<Button on:click={handleSave} disabled={isSubmitting} class="flex items-center gap-2">
			<Save class="h-4 w-4" />
			{isSubmitting ? 'Saving...' : 'Save Changes'}
		</Button>
	</div>
</div>
