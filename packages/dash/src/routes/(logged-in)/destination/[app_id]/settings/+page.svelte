<script>
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { AlertBanner } from '$lib/components/ui/alert-banner/index.js';
	import { StickyFormFooter } from '$lib/components/ui/sticky-form-footer/index.js';
	import Building2 from 'lucide-svelte/icons/building-2';
	import Globe from 'lucide-svelte/icons/globe';
	import UserIcon from 'lucide-svelte/icons/user';
	import Tag from 'lucide-svelte/icons/tag';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { data } = $props();

	let appId = $derived($page.params.app_id);

	// Form state - Display Name
	let displayName = $state(data.destination.displayName || '');

	// Form state - Domain
	let domain = $state(data.destination.domain || '');

	// Form state - Company Information
	let companyName = $state(data.destination.company?.name || '');
	let addressStreet = $state(data.destination.company?.address?.street || '');
	let addressCity = $state(data.destination.company?.address?.city || '');
	let addressState = $state(data.destination.company?.address?.state || '');
	let addressPostalCode = $state(data.destination.company?.address?.postalCode || '');
	let addressCountry = $state(data.destination.company?.address?.country || '');

	// Form state - Main Contact
	let contactName = $state(data.destination.contact?.name || '');
	let contactEmail = $state(data.destination.contact?.email || '');
	let contactPhone = $state(data.destination.contact?.phone || '');

	// UI state
	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Track original values for change detection
	let originalValues = $state({
		displayName: data.destination.displayName || '',
		domain: data.destination.domain || '',
		companyName: data.destination.company?.name || '',
		addressStreet: data.destination.company?.address?.street || '',
		addressCity: data.destination.company?.address?.city || '',
		addressState: data.destination.company?.address?.state || '',
		addressPostalCode: data.destination.company?.address?.postalCode || '',
		addressCountry: data.destination.company?.address?.country || '',
		contactName: data.destination.contact?.name || '',
		contactEmail: data.destination.contact?.email || '',
		contactPhone: data.destination.contact?.phone || ''
	});

	let hasChanges = $derived(
		displayName !== originalValues.displayName ||
			domain !== originalValues.domain ||
			companyName !== originalValues.companyName ||
			addressStreet !== originalValues.addressStreet ||
			addressCity !== originalValues.addressCity ||
			addressState !== originalValues.addressState ||
			addressPostalCode !== originalValues.addressPostalCode ||
			addressCountry !== originalValues.addressCountry ||
			contactName !== originalValues.contactName ||
			contactEmail !== originalValues.contactEmail ||
			contactPhone !== originalValues.contactPhone
	);

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
		if (!data.canEdit) return;

		saving = true;
		error = '';
		successMessage = '';

		try {
			const response = await adminFetch(`/destination/${appId}/settings/api`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					display_name: displayName,
					domain,
					company: {
						name: companyName,
						address: {
							street: addressStreet,
							city: addressCity,
							state: addressState,
							postalCode: addressPostalCode,
							country: addressCountry
						}
					},
					contact: {
						name: contactName,
						email: contactEmail,
						phone: contactPhone
					}
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
				domain,
				companyName,
				addressStreet,
				addressCity,
				addressState,
				addressPostalCode,
				addressCountry,
				contactName,
				contactEmail,
				contactPhone
			};
		} catch (err) {
			error = err.message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6 pb-24 md:pb-6">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Settings</h1>
		<p class="text-muted-foreground">Manage your destination's settings and identity</p>
	</div>

	{#if !data.canEdit}
		<AlertBanner
			variant="warning"
			message="You have view-only access to these settings. Contact an owner to make changes."
		/>
	{/if}

	{#if successMessage}
		<AlertBanner variant="success" message={successMessage} />
	{/if}

	{#if error}
		<AlertBanner variant="error" message={error} />
	{/if}

	<!-- Display Name Field -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Tag class="h-5 w-5" />
				Display Name
			</Card.Title>
			<Card.Description>
				Customize how your destination appears in the dashboard
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				<Label for="displayName">Display Name</Label>
				<Input
					id="displayName"
					type="text"
					placeholder="Enter display name"
					bind:value={displayName}
					disabled={!data.canEdit}
					maxlength="100"
				/>
				<p class="text-xs text-muted-foreground">
					Leave empty to use the default name ({data.destination.subject})
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Domain Field -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Globe class="h-5 w-5" />
				Domain
			</Card.Title>
			<Card.Description>
				Your destination's web domain for identification purposes
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				<Label for="domain">Domain URL</Label>
				<Input
					id="domain"
					type="text"
					placeholder="https://example.com"
					bind:value={domain}
					disabled={!data.canEdit}
				/>
				<p class="text-xs text-muted-foreground">
					Enter your primary website domain (e.g., https://yourcompany.com)
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Company Information -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Building2 class="h-5 w-5" />
				Company Information
			</Card.Title>
			<Card.Description>Your business details and address</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="companyName">Company Name</Label>
					<Input
						id="companyName"
						type="text"
						placeholder="Your Company Name"
						bind:value={companyName}
						disabled={!data.canEdit}
					/>
				</div>

				<div class="space-y-2">
					<Label for="addressStreet">Street Address</Label>
					<Input
						id="addressStreet"
						type="text"
						placeholder="123 Main St"
						bind:value={addressStreet}
						disabled={!data.canEdit}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="addressCity">City</Label>
						<Input
							id="addressCity"
							type="text"
							placeholder="City"
							bind:value={addressCity}
							disabled={!data.canEdit}
						/>
					</div>
					<div class="space-y-2">
						<Label for="addressState">State / Province</Label>
						<Input
							id="addressState"
							type="text"
							placeholder="State"
							bind:value={addressState}
							disabled={!data.canEdit}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="addressPostalCode">Postal Code</Label>
						<Input
							id="addressPostalCode"
							type="text"
							placeholder="12345"
							bind:value={addressPostalCode}
							disabled={!data.canEdit}
						/>
					</div>
					<div class="space-y-2">
						<Label for="addressCountry">Country</Label>
						<Input
							id="addressCountry"
							type="text"
							placeholder="Country"
							bind:value={addressCountry}
							disabled={!data.canEdit}
						/>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Main Contact -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<UserIcon class="h-5 w-5" />
				Main Contact
			</Card.Title>
			<Card.Description>Primary contact information for your business</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="contactName">Contact Name</Label>
					<Input
						id="contactName"
						type="text"
						placeholder="John Doe"
						bind:value={contactName}
						disabled={!data.canEdit}
					/>
				</div>

				<div class="space-y-2">
					<Label for="contactEmail">Email</Label>
					<Input
						id="contactEmail"
						type="email"
						placeholder="contact@example.com"
						bind:value={contactEmail}
						disabled={!data.canEdit}
					/>
				</div>

				<div class="space-y-2">
					<Label for="contactPhone">Phone</Label>
					<Input
						id="contactPhone"
						type="tel"
						placeholder="+1 (555) 123-4567"
						bind:value={contactPhone}
						disabled={!data.canEdit}
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Sticky Save Button -->
{#if data.canEdit}
	<StickyFormFooter onSave={saveSettings} disabled={!hasChanges} loading={saving} />
{/if}
