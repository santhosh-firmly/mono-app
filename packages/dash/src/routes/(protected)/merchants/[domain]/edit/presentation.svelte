<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Save, Image, PaintBucket, FileText } from 'lucide-svelte';
	import FeatureCard from '$lib/components/custom/feature-card.svelte';
	import FormField from '$lib/components/custom/form-field.svelte';

	let { merchant, saveMerchant } = $props();

	let isSubmitting = $state(false);
	let previewLogoVisible = $state(false);

	function updateThemeColor(colorType, value) {
		if (!merchant.presentation?.theme) merchant.presentation.theme = {};
		if (!merchant.presentation?.theme.colors) merchant.presentation.theme.colors = {};

		merchant.presentation.theme.colors[colorType] = value;
	}

	function updateLogo(value) {
		if (!merchant.presentation?.theme) merchant.presentation.theme = {};
		merchant.presentation.theme.largeLogo = value;
	}

	function updatePrivacyPolicy(value) {
		merchant.presentation.privacyPolicy = value;
	}

	function updateTermsOfService(value) {
		merchant.presentation.termsOfUse = value;
	}

	async function handleSave() {
		isSubmitting = true;
		try {
			await saveMerchant();
		} finally {
			isSubmitting = false;
		}
	}

	function toggleLogoPreview() {
		previewLogoVisible = !previewLogoVisible;
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-2xl font-semibold tracking-tight">Presentation Settings</h2>
		<p class="mt-2 text-muted-foreground">
			Customize the visual appearance of the merchant's experience.
		</p>
	</div>

	<div class="my-8 border-t border-border"></div>

	<!-- Color Settings -->
	<FeatureCard
		title="Colors"
		description="Configure the merchant's brand color scheme"
		icon={PaintBucket}
		spacing="space-y-6"
	>
		<!-- Primary Color -->
		<FormField
			id="primary_color"
			label="Primary Color"
			helpText="Main background color used in the merchant's theme."
		>
			<div class="relative w-full">
				<Input
					id="primary_color"
					value={merchant.presentation?.theme?.colors?.primary || '#ffffff'}
					oninput={(e) => updateThemeColor('primary', e.target.value)}
					placeholder="#ffffff"
				/>
				<div class="absolute right-2 top-[50%] flex translate-y-[-50%] items-center gap-2">
					<input
						type="color"
						value={merchant.presentation?.theme?.colors?.primary || '#ffffff'}
						oninput={(e) => updateThemeColor('primary', e.target.value)}
						class="w-6 cursor-pointer rounded-lg border bg-transparent p-0"
					/>
				</div>
			</div>
		</FormField>

		<!-- Action Color -->
		<FormField
			id="action_color"
			label="Action Color"
			helpText="Color used for buttons and actionable elements."
		>
			<div class="relative w-full">
				<Input
					id="action_color"
					value={merchant.presentation?.theme?.colors?.action || '#000000'}
					oninput={(e) => updateThemeColor('action', e.target.value)}
					placeholder="#000000"
				/>
				<div class="absolute right-2 top-[50%] flex translate-y-[-50%] items-center">
					<input
						type="color"
						value={merchant.presentation?.theme?.colors?.action || '#000000'}
						oninput={(e) => updateThemeColor('action', e.target.value)}
						class="w-6 cursor-pointer rounded-lg border bg-transparent"
					/>
				</div>
			</div>
		</FormField>

		<!-- Color Preview -->
		<div class="mt-4 rounded-md border p-4">
			<h4 class="mb-3 text-sm font-medium">Preview</h4>
			<div class="flex flex-col gap-4">
				<div
					class="rounded-md p-4"
					style="background-color: {merchant.presentation?.theme?.colors?.primary ||
						'#fffff'}"
				>
					<div class="flex justify-center">
						<button
							class="rounded-md px-4 py-2 font-medium text-white"
							style="background-color: {merchant.presentation?.theme?.colors
								?.action || '#000000'}"
						>
							Action Button
						</button>
					</div>
				</div>
			</div>
		</div>
	</FeatureCard>

	<!-- Logo -->
	<FeatureCard title="Logo" description="Merchant's brand logo in SVG format" icon={Image}>
		<div class="grid grid-cols-1 items-start gap-4">
			<div>
				<Label for="logo" class="text-sm font-medium">Logo SVG Data</Label>
				<p class="text-sm text-muted-foreground">The SVG data URI for the merchant logo.</p>
			</div>
			<div>
				<textarea
					id="logo"
					class="h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					value={merchant.presentation?.theme?.largeLogo || ''}
					oninput={(e) => updateLogo(e.target.value)}
					placeholder="data:image/svg+xml,..."
				></textarea>
			</div>
			<div class="flex flex-col gap-4">
				<Button variant="outline" size="sm" on:click={toggleLogoPreview} class="w-fit">
					{previewLogoVisible ? 'Hide Preview' : 'Show Preview'}
				</Button>
				{#if previewLogoVisible && merchant.presentation?.theme?.largeLogo}
					<div class="rounded-md border bg-white p-4">
						<img
							src={merchant.presentation?.theme.largeLogo}
							alt="Logo Preview"
							class="mx-auto max-h-40"
						/>
					</div>
				{/if}
			</div>
		</div>
	</FeatureCard>

	<!-- External -->
	<FeatureCard title="External" description="External links for the merchant" icon={FileText}>
		<FormField
			id="privacy_policy"
			label="Privacy Policy URL"
			helpText="The URL to the merchant's privacy policy."
		>
			<Input
				id="privacy_policy"
				value={merchant.presentation?.privacyPolicy || ''}
				oninput={(e) => updatePrivacyPolicy(e.target.value)}
				placeholder="https://example.com/privacy-policy"
			/>
		</FormField>

		<FormField
			id="terms_of_service"
			label="Terms of Service URL"
			helpText="The URL to the merchant's terms of service."
		>
			<Input
				id="terms_of_service"
				value={merchant.presentation?.termsOfUse || ''}
				oninput={(e) => updateTermsOfService(e.target.value)}
				placeholder="https://example.com/terms-of-service"
			/>
		</FormField>
	</FeatureCard>

	<!-- Save Button -->
	<div class="flex justify-end pt-6">
		<Button on:click={handleSave} disabled={isSubmitting} class="flex items-center gap-2">
			<Save class="h-4 w-4" />
			{isSubmitting ? 'Saving...' : 'Save Changes'}
		</Button>
	</div>
</div>
