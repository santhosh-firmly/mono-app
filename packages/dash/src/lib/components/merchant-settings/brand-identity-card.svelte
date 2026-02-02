<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Palette from 'lucide-svelte/icons/palette';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import X from 'lucide-svelte/icons/x';
	import Image from 'lucide-svelte/icons/image';
	import { adminFetch } from '$lib/utils/fetch.js';

	let {
		displayName = $bindable(''),
		primaryColor = $bindable('#ffffff'),
		actionColor = $bindable('#000000'),
		largeLogo = $bindable(''),
		disabled = false,
		logoProxyUrl = ''
	} = $props();

	// Logo input state - single unified input
	let logoInput = $state('');
	let logoLoading = $state(false);
	let logoError = $state('');

	// Pre-populate input if there's an existing logo
	$effect(() => {
		if (largeLogo && !logoInput) {
			logoInput = largeLogo;
		}
	});

	/**
	 * Detect the type of logo input
	 */
	function detectInputType(input) {
		const trimmed = input.trim();
		if (trimmed.startsWith('data:image/')) return 'datauri';
		if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) return 'svg';
		if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return 'url';
		return null;
	}

	/**
	 * Convert raw SVG string to data URI
	 */
	function svgToDataUri(svg) {
		const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
		return `data:image/svg+xml,${encoded}`;
	}

	/**
	 * Fetch image from URL and convert to base64 data URI
	 */
	async function fetchImageAsDataUri(url) {
		if (!logoProxyUrl) {
			throw new Error('Logo proxy URL not configured');
		}

		const response = await adminFetch(`${logoProxyUrl}?url=${encodeURIComponent(url)}`);

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || 'Failed to fetch image');
		}

		const result = await response.json();
		return result.dataUri;
	}

	/**
	 * Process logo input based on auto-detected type
	 */
	async function processLogoInput() {
		if (disabled) return;

		const inputType = detectInputType(logoInput);
		if (!inputType) {
			logoError =
				'Could not detect input type. Please enter a valid URL, SVG code, or data URI.';
			return;
		}

		logoError = '';
		logoLoading = true;

		try {
			let dataUri = '';

			if (inputType === 'url') {
				// Fetch and convert URL to data URI
				dataUri = await fetchImageAsDataUri(logoInput.trim());
			} else if (inputType === 'svg') {
				// Convert raw SVG to data URI
				const svg = logoInput.trim();
				dataUri = svgToDataUri(svg);
			} else if (inputType === 'datauri') {
				// Use data URI directly
				dataUri = logoInput.trim();
			}

			if (dataUri) {
				largeLogo = dataUri;
			}
		} catch (err) {
			logoError = err.message;
		} finally {
			logoLoading = false;
		}
	}

	/**
	 * Clear the logo
	 */
	function clearLogo() {
		largeLogo = '';
		logoInput = '';
		logoError = '';
	}

	// Derive the detected type for display
	let detectedType = $derived(() => {
		const type = detectInputType(logoInput);
		if (type === 'url') return 'Image URL';
		if (type === 'svg') return 'SVG Code';
		if (type === 'datauri') return 'Data URI';
		return null;
	});
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
				<Palette class="h-5 w-5 text-purple-600" />
			</div>
			<div>
				<Card.Title>Brand Identity</Card.Title>
				<Card.Description>Configure your store name, logo, and colors</Card.Description>
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Left Column: Form Fields -->
			<div class="space-y-8">
				<!-- Display Name -->
				<div class="space-y-2">
					<Label for="displayName">Display Name</Label>
					<Input
						id="displayName"
						bind:value={displayName}
						placeholder="My Store Name"
						{disabled}
					/>
					<p class="text-sm text-muted-foreground">
						This name will be shown to customers during checkout.
					</p>
				</div>

				<!-- Logo Section -->
				<div class="space-y-4">
					<div>
						<h4 class="text-sm font-medium">Logo</h4>
						<p class="text-sm text-muted-foreground">
							Your brand logo displayed during checkout
						</p>
					</div>

					<!-- Unified Logo Input -->
					<div class="space-y-2">
						<Label for="logoInput">Logo Source</Label>
						<textarea
							id="logoInput"
							bind:value={logoInput}
							disabled={disabled || logoLoading}
							class="h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter an image URL, paste SVG code, or provide a data URI"
						></textarea>
						<div class="flex items-center justify-between">
							<p class="text-sm text-muted-foreground">
								Supports URLs, raw SVG code, and data URIs
							</p>
							{#if logoInput && detectedType()}
								<span class="text-xs text-purple-600 font-medium">
									Detected: {detectedType()}
								</span>
							{/if}
						</div>
					</div>

					<!-- Error Message -->
					{#if logoError}
						<div
							class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
						>
							<AlertCircle class="h-4 w-4 flex-shrink-0" />
							{logoError}
						</div>
					{/if}

					<!-- Action Buttons -->
					{#if !disabled}
						<div class="flex gap-2">
							<Button
								onclick={processLogoInput}
								disabled={logoLoading || !logoInput.trim()}
								variant="outline"
								size="sm"
							>
								{#if logoLoading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									Processing...
								{:else}
									<CheckCircle class="mr-2 h-4 w-4" />
									Apply Logo
								{/if}
							</Button>
							{#if largeLogo}
								<Button variant="ghost" size="sm" onclick={clearLogo}>
									<X class="mr-2 h-4 w-4" />
									Clear
								</Button>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Brand Colors Section -->
				<div class="space-y-4">
					<div>
						<h4 class="text-sm font-medium">Brand Colors</h4>
						<p class="text-sm text-muted-foreground">
							Customize your checkout appearance
						</p>
					</div>

					<div class="grid gap-6 sm:grid-cols-2">
						<!-- Primary Color Picker -->
						<div class="space-y-3">
							<Label for="primaryColor">Primary Color</Label>
							<div class="flex items-center gap-3">
								<label
									class="relative flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md {disabled
										? 'cursor-not-allowed opacity-50'
										: ''}"
									style="background-color: {primaryColor}"
								>
									<input
										type="color"
										bind:value={primaryColor}
										{disabled}
										class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
									/>
									<div
										class="absolute inset-0 rounded-lg"
										style="box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1)"
									></div>
								</label>
								<div class="flex-1">
									<Input
										id="primaryColor"
										bind:value={primaryColor}
										placeholder="#ffffff"
										{disabled}
										class="font-mono text-sm uppercase"
									/>
								</div>
							</div>
							<p class="text-xs text-muted-foreground">Background color</p>
						</div>

						<!-- Action Color Picker -->
						<div class="space-y-3">
							<Label for="actionColor">Action Color</Label>
							<div class="flex items-center gap-3">
								<label
									class="relative flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md {disabled
										? 'cursor-not-allowed opacity-50'
										: ''}"
									style="background-color: {actionColor}"
								>
									<input
										type="color"
										bind:value={actionColor}
										{disabled}
										class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
									/>
									<div
										class="absolute inset-0 rounded-lg"
										style="box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1)"
									></div>
								</label>
								<div class="flex-1">
									<Input
										id="actionColor"
										bind:value={actionColor}
										placeholder="#000000"
										{disabled}
										class="font-mono text-sm uppercase"
									/>
								</div>
							</div>
							<p class="text-xs text-muted-foreground">Buttons & links</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Brand Preview -->
			<div class="space-y-3 lg:sticky lg:top-4 lg:self-start">
				<h4 class="text-sm font-medium">Brand Preview</h4>
				<div class="overflow-hidden rounded-xl border shadow-sm">
					<!-- Header section with primary color -->
					<div
						class="flex flex-col items-center justify-center p-6"
						style="background-color: {primaryColor}"
					>
						{#if largeLogo}
							<img
								src={largeLogo}
								alt="Logo Preview"
								class="h-10 w-auto object-contain mb-3"
							/>
						{:else}
							<div class="flex items-center justify-center h-10 mb-3">
								<Image class="h-6 w-6 opacity-30" style="color: {actionColor}" />
							</div>
						{/if}
						<p class="text-sm font-medium" style="color: {actionColor}">
							{displayName || 'Your Store'}
						</p>
						<p class="text-xs mt-1 opacity-60" style="color: {actionColor}">
							Complete your purchase
						</p>
					</div>

					<!-- Buttons section with white background -->
					<div class="bg-white p-6">
						<div class="w-full max-w-xs mx-auto space-y-3">
							<button
								class="w-full rounded-lg px-6 py-3 font-medium text-white shadow-sm transition-all"
								style="background-color: {actionColor}"
							>
								Pay Now
							</button>
							<button
								class="w-full rounded-lg border-2 px-6 py-2.5 text-sm font-medium transition-all"
								style="border-color: {actionColor}; color: {actionColor}"
							>
								Add to Cart
							</button>
						</div>
					</div>
				</div>
				<p class="text-sm text-muted-foreground">
					Preview of how your brand will appear during checkout
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
