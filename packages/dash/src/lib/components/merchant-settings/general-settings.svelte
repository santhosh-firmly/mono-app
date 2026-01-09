<script>
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Switch from '$lib/components/ui/switch/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Store, Globe, Cog, ToggleLeft, Palette, FileText, Building2 } from 'lucide-svelte';
	import Combobox from '$lib/components/custom/combobox.svelte';
	import FeatureCard from '$lib/components/custom/feature-card.svelte';
	import FormField from '$lib/components/custom/form-field.svelte';
	import BrandIdentityCard from './brand-identity-card.svelte';

	let {
		merchant,
		updateField,
		addUrlName,
		removeUrlName,
		updateUrlName,
		currencyOptions,
		platformOptions,
		pspOptions,
		// Brand identity props
		displayName = $bindable(''),
		primaryColor = $bindable('#ffffff'),
		actionColor = $bindable('#000000'),
		largeLogo = $bindable(''),
		logoProxyUrl = '',
		// Terms & Privacy props
		termsUrl = $bindable(''),
		privacyUrl = $bindable('')
	} = $props();

	let activeTab = $state('company');
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-2xl font-semibold tracking-tight">General Settings</h2>
		<p class="mt-2 text-muted-foreground">
			Manage merchant information, branding, and legal documents.
		</p>
	</div>

	<Tabs.Root bind:value={activeTab} class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="company" class="gap-2">
				<Building2 class="h-4 w-4" />
				Company Information
			</Tabs.Trigger>
			<Tabs.Trigger value="brand" class="gap-2">
				<Palette class="h-4 w-4" />
				Brand Identity
			</Tabs.Trigger>
			<Tabs.Trigger value="legal" class="gap-2">
				<FileText class="h-4 w-4" />
				Terms & Privacy
			</Tabs.Trigger>
		</Tabs.List>

		<!-- Company Information Tab -->
		<Tabs.Content value="company" class="space-y-6 pt-6">
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
				<Button variant="outline" on:click={addUrlName} size="sm" class="mt-2"
					>Add Domain</Button
				>
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
				<FormField
					id="psp"
					label="PSP"
					helpText="Which adapter will be used to process payments"
				>
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
					/>
				</div>
			</FeatureCard>
		</Tabs.Content>

		<!-- Brand Identity Tab -->
		<Tabs.Content value="brand" class="pt-6">
			<BrandIdentityCard
				bind:displayName
				bind:primaryColor
				bind:actionColor
				bind:largeLogo
				{logoProxyUrl}
			/>
		</Tabs.Content>

		<!-- Terms & Privacy Tab -->
		<Tabs.Content value="legal" class="pt-6">
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"
						>
							<FileText class="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<Card.Title>Legal Documents</Card.Title>
							<Card.Description
								>Links to your terms of service and privacy policy</Card.Description
							>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="termsUrl">Terms of Service URL</Label>
						<Input
							id="termsUrl"
							bind:value={termsUrl}
							placeholder="https://example.com/terms"
						/>
						<p class="text-sm text-muted-foreground">
							Link to your terms of service that customers must agree to.
						</p>
					</div>

					<div class="space-y-2">
						<Label for="privacyUrl">Privacy Policy URL</Label>
						<Input
							id="privacyUrl"
							bind:value={privacyUrl}
							placeholder="https://example.com/privacy"
						/>
						<p class="text-sm text-muted-foreground">
							Link to your privacy policy that explains how customer data is handled.
						</p>
					</div>

					<div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
						<p class="text-sm text-blue-700">
							These links will be displayed during checkout so customers can review
							your policies before completing their purchase.
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
