<script>
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Switch from '$lib/components/ui/switch/index.js';
	import { Store, Globe, Cog, ToggleLeft } from 'lucide-svelte';
	import Combobox from '$lib/components/custom/combobox.svelte';
	import FeatureCard from '$lib/components/custom/feature-card.svelte';
	import FormField from '$lib/components/custom/form-field.svelte';

	let {
		merchant,
		updateField,
		addUrlName,
		removeUrlName,
		updateUrlName,
		currencyOptions,
		platformOptions,
		pspOptions
	} = $props();
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-2xl font-semibold tracking-tight">General Settings</h2>
		<p class="mt-2 text-muted-foreground">Manage the basic information about the merchant.</p>
	</div>

	<div class="my-8 border-t border-border"></div>

	<!-- Main Info -->
	<FeatureCard
		title="Merchant Information"
		description="Basic details about your merchant"
		icon={Store}
	>
		<!-- Display Name -->
		<FormField
			id="display_name"
			label="Display Name"
			helpText="Name used to identify the merchant."
		>
			<Input
				id="display_name"
				value={merchant.display_name}
				on:input={(e) => updateField('display_name', e.target.value)}
				placeholder="My Shop Name"
			/>
		</FormField>

		<!-- Store ID -->
		<FormField
			id="store_id"
			label="Store ID"
			helpText="Unique identifier for the merchant's store."
		>
			<Input
				id="store_id"
				value={merchant.store_id}
				on:input={(e) => updateField('store_id', e.target.value)}
				placeholder="store-id"
			/>
		</FormField>

		<!-- Base URL -->
		<FormField
			id="base_url"
			label="Base URL"
			helpText="URL used to access the merchant's website."
		>
			<Input
				id="base_url"
				value={merchant.base_url}
				on:input={(e) => updateField('base_url', e.target.value)}
				placeholder="https://www.example.com"
			/>
		</FormField>
	</FeatureCard>

	<!-- URL Names -->
	<FeatureCard
		title="Domain Names"
		description="URLs where the merchant is accessible"
		icon={Globe}
	>
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
		<Button variant="outline" on:click={addUrlName} size="sm" class="mt-2">Add Domain</Button>
	</FeatureCard>

	<!-- Platform & Payments -->
	<FeatureCard
		title="Integration Settings"
		description="Platform and payment configuration"
		icon={Cog}
	>
		<!-- Currency (USD only) -->
		<FormField
			id="shop_currency"
			label="Currency"
			helpText="Currency used by the merchant's store."
		>
			<Combobox
				value={merchant.shop_currency}
				options={currencyOptions}
				onSelect={(value) => updateField('shop_currency', value)}
				placeholder="Select a currency"
			/>
		</FormField>

		<!-- Platform Selection -->
		<FormField
			id="platform_type"
			label="Platform"
			helpText="Platform on which the merchant operates."
		>
			<Combobox
				value={merchant.platform_id}
				options={platformOptions}
				onSelect={(value) => updateField('platform_id', value)}
				placeholder="Select a platform"
			/>
		</FormField>

		<!-- PSP Selection -->
		<FormField id="psp" label="PSP" helpText="Which adapter will be used to process payments">
			<Combobox
				value={merchant.psp}
				options={pspOptions}
				onSelect={(value) => updateField('psp', value)}
				placeholder="Select a payment provider"
			/>
		</FormField>
	</FeatureCard>

	<!-- Status -->
	<FeatureCard
		title="Merchant Status"
		description="Toggle merchant availability"
		icon={ToggleLeft}
		spacing=""
	>
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
	</FeatureCard>
</div>
