<script>
	import { page } from '$app/stores';
	import { beforeNavigate, goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Save from 'lucide-svelte/icons/save';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import Tag from 'lucide-svelte/icons/tag';
	import Shield from 'lucide-svelte/icons/shield';
	import Clock from 'lucide-svelte/icons/clock';
	import Database from 'lucide-svelte/icons/database';
	import Users from 'lucide-svelte/icons/users';
	import FolderOpen from 'lucide-svelte/icons/folder-open';
	import CategoryCombobox from '$lib/components/admin/category-combobox.svelte';

	let { data } = $props();

	let appId = $derived($page.params.appId);

	// Form state
	let displayName = $state(data.destination.displayName || '');
	let isSystem = $state(data.destination.isSystem);
	let isComingSoon = $state(data.destination.isComingSoon);
	let partnerTokenExpiration = $state(data.destination.partnerTokenExpiration);
	let disableOrderSaving = $state(data.destination.disableOrderSaving);
	let restrictMerchantAccess = $state(data.destination.restrictMerchantAccess);
	let category = $state(data.destination.category || '');

	// UI state
	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Track original values for change detection
	let originalValues = $state({
		displayName: data.destination.displayName || '',
		isSystem: data.destination.isSystem,
		isComingSoon: data.destination.isComingSoon,
		partnerTokenExpiration: data.destination.partnerTokenExpiration,
		disableOrderSaving: data.destination.disableOrderSaving,
		restrictMerchantAccess: data.destination.restrictMerchantAccess,
		category: data.destination.category || ''
	});

	let hasChanges = $derived(
		displayName !== originalValues.displayName ||
			isSystem !== originalValues.isSystem ||
			isComingSoon !== originalValues.isComingSoon ||
			partnerTokenExpiration !== originalValues.partnerTokenExpiration ||
			disableOrderSaving !== originalValues.disableOrderSaving ||
			restrictMerchantAccess !== originalValues.restrictMerchantAccess ||
			category !== originalValues.category
	);

	// Validation - allow up to 3 months (7776000 seconds = 90 days)
	let tokenExpirationError = $derived(() => {
		const val = parseInt(partnerTokenExpiration, 10);
		if (isNaN(val) || val < 60) return 'Must be at least 60 seconds (1 minute)';
		if (val > 7776000) return 'Cannot exceed 7776000 seconds (90 days)';
		return '';
	});

	let isValid = $derived(!tokenExpirationError());

	// Quick selection presets for token expiration
	const tokenPresets = [
		{ label: '1 hour', value: 3600 },
		{ label: '12 hours', value: 43200 },
		{ label: '1 day', value: 86400 },
		{ label: '1 week', value: 604800 },
		{ label: '1 month', value: 2592000 },
		{ label: '3 months', value: 7776000 }
	];

	function formatTokenExpiration(seconds) {
		if (seconds < 60) return `${seconds} seconds`;
		if (seconds < 3600) return `${Math.round(seconds / 60)} minute(s)`;
		if (seconds === 3600) return '1 hour';
		if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hour(s)`;
		if (seconds === 86400) return '1 day';
		if (seconds < 604800) return `${(seconds / 86400).toFixed(1)} day(s)`;
		if (seconds === 604800) return '1 week';
		if (seconds < 2592000) return `${(seconds / 604800).toFixed(1)} week(s)`;
		if (seconds === 2592000) return '1 month';
		if (seconds < 7776000) return `${(seconds / 2592000).toFixed(1)} month(s)`;
		return '3 months';
	}

	// Unsaved changes warning - browser close/refresh
	$effect(() => {
		function handleBeforeUnload(event) {
			if (hasChanges) {
				event.preventDefault();
				event.returnValue = '';
				return '';
			}
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('beforeunload', handleBeforeUnload);
			return () => window.removeEventListener('beforeunload', handleBeforeUnload);
		}
	});

	// Unsaved changes warning - SvelteKit navigation
	beforeNavigate(({ cancel }) => {
		if (hasChanges && !saving) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
				cancel();
			}
		}
	});

	async function saveSettings() {
		if (!isValid) return;

		saving = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/admin/destinations/${encodeURIComponent(appId)}/api`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					display_name: displayName,
					isSystem,
					isComingSoon,
					partnerTokenExpiration: parseInt(partnerTokenExpiration, 10),
					disableOrderSaving,
					restrictMerchantAccess,
					category
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to save settings');
			}

			successMessage = 'Settings saved successfully!';

			// Update original values to reflect saved state
			originalValues = {
				displayName,
				isSystem,
				isComingSoon,
				partnerTokenExpiration: parseInt(partnerTokenExpiration, 10),
				disableOrderSaving,
				restrictMerchantAccess,
				category
			};
		} catch (err) {
			error = err.message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6 pb-24 md:pb-6">
	<!-- Header with back button -->
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" onclick={() => goto('/admin/destinations')}>
			<ChevronLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-semibold text-foreground">
				{data.destination.displayName || data.destination.subject}
			</h1>
			<p class="text-muted-foreground">Configure destination settings</p>
		</div>
	</div>

	{#if successMessage}
		<Card.Root class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
			<Card.Content class="py-4">
				<div class="flex items-center gap-3">
					<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
					<p class="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if error}
		<Card.Root class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
			<Card.Content class="py-4">
				<div class="flex items-center gap-3">
					<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
					<p class="text-sm text-red-700 dark:text-red-300">{error}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Identity (Read-only) -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Tag class="h-5 w-5" />
				Identity
			</Card.Title>
			<Card.Description>Destination identification (read-only)</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label>Subject</Label>
					<div class="px-3 py-2 bg-muted rounded-md text-sm">
						{data.destination.subject}
					</div>
				</div>
				<div class="space-y-2">
					<Label>App ID / Client ID</Label>
					<div class="px-3 py-2 bg-muted rounded-md font-mono text-sm">
						{data.destination.clientId}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Display Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Tag class="h-5 w-5" />
				Display Settings
			</Card.Title>
			<Card.Description>Customize how this destination appears</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				<Label for="displayName">Display Name</Label>
				<Input
					id="displayName"
					type="text"
					placeholder="Enter display name"
					bind:value={displayName}
					maxlength="100"
				/>
				<p class="text-xs text-muted-foreground">
					Leave empty to use the subject ({data.destination.subject})
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Category -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<FolderOpen class="h-5 w-5" />
				Category
			</Card.Title>
			<Card.Description
				>Organize this destination into a category for merchants</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				<Label for="category">Category</Label>
				<CategoryCombobox
					value={category}
					customCategories={data.allCategories}
					onSelect={(val) => (category = val)}
					placeholder="Select or type a category..."
				/>
				<p class="text-xs text-muted-foreground">
					Choose from predefined categories or type a custom one
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- System Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Shield class="h-5 w-5" />
				System Settings
			</Card.Title>
			<Card.Description>Control visibility and access</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<Label>System Destination</Label>
						<p class="text-sm text-muted-foreground">
							System destinations are hidden from merchant destination selection
						</p>
					</div>
					<Switch bind:checked={isSystem} />
				</div>
				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<Label>Coming Soon</Label>
						<p class="text-sm text-muted-foreground">
							Mark this destination as coming soon (merchants cannot enable it)
						</p>
					</div>
					<Switch bind:checked={isComingSoon} />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Merchant Access -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Users class="h-5 w-5" />
				Merchant Access
			</Card.Title>
			<Card.Description>Control if merchants can restrict this destination</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>Restrict Merchant Access</Label>
					<p class="text-sm text-muted-foreground">
						{#if restrictMerchantAccess}
							This destination may not be able to access all merchants
						{:else}
							This destination has unrestricted access to all merchants
						{/if}
					</p>
				</div>
				<Switch bind:checked={restrictMerchantAccess} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Integration Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Clock class="h-5 w-5" />
				Integration Settings
			</Card.Title>
			<Card.Description>Configure integration behavior</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-6">
				<div class="space-y-3">
					<Label for="tokenExpiration">Token Expiration (seconds)</Label>
					<Input
						id="tokenExpiration"
						type="number"
						min="60"
						max="7776000"
						bind:value={partnerTokenExpiration}
					/>
					<div class="flex flex-wrap gap-2">
						{#each tokenPresets as preset (preset.value)}
							<Button
								type="button"
								variant={partnerTokenExpiration === preset.value
									? 'default'
									: 'outline'}
								size="sm"
								onclick={() => (partnerTokenExpiration = preset.value)}
							>
								{preset.label}
							</Button>
						{/each}
					</div>
					{#if tokenExpirationError()}
						<p class="text-xs text-red-600">{tokenExpirationError()}</p>
					{:else}
						<p class="text-xs text-muted-foreground">
							Authentication tokens will be valid for {formatTokenExpiration(
								partnerTokenExpiration
							)}
						</p>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Order Storage -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Database class="h-5 w-5" />
				Order Storage
			</Card.Title>
			<Card.Description>Configure order data retention</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>Disable Order Saving</Label>
					<p class="text-sm text-muted-foreground">
						{#if disableOrderSaving}
							Order details will not be stored for this destination
						{:else}
							Order details will be stored and visible in the dashboard
						{/if}
					</p>
				</div>
				<Switch bind:checked={disableOrderSaving} />
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Sticky Save Button -->
<div
	class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-4 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:mt-6"
>
	<div class="flex justify-end max-w-4xl mx-auto md:max-w-none">
		<Button
			onclick={saveSettings}
			disabled={saving || !hasChanges || !isValid}
			class="bg-primary hover:bg-primary/90 w-full md:w-auto"
			size="lg"
		>
			{#if saving}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				Saving...
			{:else}
				<Save class="mr-2 h-5 w-5" />
				Save Changes
			{/if}
		</Button>
	</div>
</div>
