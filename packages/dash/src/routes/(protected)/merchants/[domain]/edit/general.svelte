<script>
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Switch from '$lib/components/ui/switch/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Save } from 'lucide-svelte';
	import Combobox from '$lib/components/custom/combobox.svelte';

	// Using $props rune for component properties
	let {
		merchant,
		updateField,
		addUrlName,
		removeUrlName,
		updateUrlName,
		currencyOptions,
		platformOptions,
		pspOptions,
		saveMerchant
	} = $props();

	// Track if form is being submitted
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
		<h2 class="text-2xl font-semibold tracking-tight">General Settings</h2>
		<p class="mt-2 text-muted-foreground">Manage the basic information about the merchant.</p>
	</div>

	<div class="my-8 border-t border-border"></div>

	<!-- Main Info -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Merchant Information</Card.Title>
			<Card.Description>Basic details about your merchant</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Display Name -->
			<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
				<div class="md:col-span-2">
					<Label for="display_name" class="text-sm font-medium">Display Name</Label>
					<p class="text-sm text-muted-foreground">Name used to identify the merchant.</p>
				</div>
				<div class="md:col-span-3">
					<Input
						id="display_name"
						value={merchant.display_name}
						on:input={(e) => updateField('display_name', e.target.value)}
						placeholder="My Shop Name"
					/>
				</div>
			</div>

			<!-- Store ID -->
			<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
				<div class="md:col-span-2">
					<Label for="store_id" class="text-sm font-medium">Store ID</Label>
					<p class="text-sm text-muted-foreground">
						Unique identifier for the merchant's store.
					</p>
				</div>
				<div class="md:col-span-3">
					<Input
						id="store_id"
						value={merchant.store_id}
						on:input={(e) => updateField('store_id', e.target.value)}
						placeholder="store-id"
					/>
				</div>
			</div>

			<!-- Base URL -->
			<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
				<div class="md:col-span-2">
					<Label for="base_url" class="text-sm font-medium">Base URL</Label>
					<p class="text-sm text-muted-foreground">
						URL used to access the merchant's website.
					</p>
				</div>
				<div class="md:col-span-3">
					<Input
						id="base_url"
						value={merchant.base_url}
						on:input={(e) => updateField('base_url', e.target.value)}
						placeholder="https://www.example.com"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- URL Names -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Domain Names</Card.Title>
			<Card.Description>URLs where the merchant is accessible</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each merchant.url_name as url, index (index)}
				<div class="flex items-center gap-3">
					<Input
						value={url}
						on:input={(e) => updateUrlName(index, e.target.value)}
						placeholder="example.com"
						class="flex-grow"
					/>
					<Button
						variant="outline"
						size="icon"
						on:click={() => removeUrlName(index)}
						aria-label="Remove URL"
					>
						&times;
					</Button>
				</div>
			{/each}
			<Button variant="outline" on:click={addUrlName} size="sm" class="mt-2"
				>Add Domain</Button
			>
		</Card.Content>
	</Card.Root>

	<!-- Platform & Payments -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Integration Settings</Card.Title>
			<Card.Description>Platform and payment configuration</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Currency (USD only) -->
			<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
				<div class="md:col-span-2">
					<Label for="shop_currency" class="text-sm font-medium">Currency</Label>
					<p class="text-sm text-muted-foreground">
						Currency used by the merchant's store.
					</p>
				</div>
				<div class="md:col-span-3">
					<Combobox
						value={merchant.shop_currency}
						options={currencyOptions}
						onSelect={(value) => updateField('shop_currency', value)}
						placeholder="Select a currency"
					/>
				</div>
			</div>

			<!-- Platform Selection -->
			<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
				<div class="md:col-span-2">
					<Label for="platform_type" class="text-sm font-medium">Platform</Label>
					<p class="text-sm text-muted-foreground">
						Platform on which the merchant operates.
					</p>
				</div>
				<div class="md:col-span-3">
					<Combobox
						value={merchant.platform_id}
						options={platformOptions}
						onSelect={(value) => updateField('platform_id', value)}
						placeholder="Select a platform"
					/>
				</div>
			</div>

			<!-- PSP Selection -->
			<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-5">
				<div class="md:col-span-2">
					<Label for="psp" class="text-sm font-medium">PSP</Label>
					<p class="text-sm text-muted-foreground">
						Which adapter will be used to process payments
					</p>
				</div>
				<div class="md:col-span-3">
					<Combobox
						value={merchant.psp}
						options={pspOptions}
						onSelect={(value) => updateField('psp', value)}
						placeholder="Select a payment provider"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Status -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Merchant Status</Card.Title>
			<Card.Description>Toggle merchant availability</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center justify-between">
				<div>
					<h4 class="font-medium">Active Status</h4>
					<p class="text-sm text-muted-foreground">
						Disable to temporarily prevent operations
					</p>
				</div>
				<Switch.Root
					checked={!merchant.is_disabled}
					onCheckedChange={(checked) => updateField('is_disabled', !checked)}
				>
					<Switch.Thumb />
				</Switch.Root>
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
