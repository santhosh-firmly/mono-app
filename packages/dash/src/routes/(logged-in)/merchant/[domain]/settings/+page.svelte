<script>
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Save from 'lucide-svelte/icons/save';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import {
		BrandIdentityCard,
		LegalDocumentsCard,
		CompanyInfoCard,
		MainContactCard
	} from '$lib/components/merchant-settings/index.js';

	let { data } = $props();

	let domain = $derived($page.params.domain);

	// Tab state
	let activeSection = $state('company');

	// Form state - Branding
	let displayName = $state(data.merchant.displayName);
	let primaryColor = $state(data.merchant.presentation?.theme?.colors?.primary || '#ffffff');
	let actionColor = $state(data.merchant.presentation?.theme?.colors?.action || '#000000');
	let largeLogo = $state(data.merchant.presentation?.theme?.largeLogo || '');
	let privacyPolicy = $state(data.merchant.presentation?.privacyPolicy || '');
	let termsOfUse = $state(data.merchant.presentation?.termsOfUse || '');

	// Form state - Company Information
	let companyName = $state(data.merchant.company?.name || '');
	let employeeCount = $state(data.merchant.company?.employeeCount || '');
	let annualRevenue = $state(data.merchant.company?.annualRevenue || '');
	let addressStreet = $state(data.merchant.company?.address?.street || '');
	let addressCity = $state(data.merchant.company?.address?.city || '');
	let addressState = $state(data.merchant.company?.address?.state || '');
	let addressPostalCode = $state(data.merchant.company?.address?.postalCode || '');
	let addressCountry = $state(data.merchant.company?.address?.country || '');

	// Form state - Main Contact
	let contactName = $state(data.merchant.contact?.name || '');
	let contactEmail = $state(data.merchant.contact?.email || '');
	let contactPhone = $state(data.merchant.contact?.phone || '');

	// UI state
	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Track original values for change detection
	let originalValues = $state({
		displayName: data.merchant.displayName,
		primaryColor: data.merchant.presentation?.theme?.colors?.primary || '#ffffff',
		actionColor: data.merchant.presentation?.theme?.colors?.action || '#000000',
		largeLogo: data.merchant.presentation?.theme?.largeLogo || '',
		privacyPolicy: data.merchant.presentation?.privacyPolicy || '',
		termsOfUse: data.merchant.presentation?.termsOfUse || '',
		// Company
		companyName: data.merchant.company?.name || '',
		employeeCount: data.merchant.company?.employeeCount || '',
		annualRevenue: data.merchant.company?.annualRevenue || '',
		addressStreet: data.merchant.company?.address?.street || '',
		addressCity: data.merchant.company?.address?.city || '',
		addressState: data.merchant.company?.address?.state || '',
		addressPostalCode: data.merchant.company?.address?.postalCode || '',
		addressCountry: data.merchant.company?.address?.country || '',
		// Contact
		contactName: data.merchant.contact?.name || '',
		contactEmail: data.merchant.contact?.email || '',
		contactPhone: data.merchant.contact?.phone || ''
	});

	let hasChanges = $derived(
		displayName !== originalValues.displayName ||
			primaryColor !== originalValues.primaryColor ||
			actionColor !== originalValues.actionColor ||
			largeLogo !== originalValues.largeLogo ||
			privacyPolicy !== originalValues.privacyPolicy ||
			termsOfUse !== originalValues.termsOfUse ||
			companyName !== originalValues.companyName ||
			employeeCount !== originalValues.employeeCount ||
			annualRevenue !== originalValues.annualRevenue ||
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
			const response = await fetch(`/merchant/${domain}/settings/api`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					displayName,
					presentation: {
						theme: {
							colors: {
								primary: primaryColor,
								action: actionColor
							},
							largeLogo
						},
						privacyPolicy,
						termsOfUse
					},
					company: {
						name: companyName,
						employeeCount,
						annualRevenue,
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
				primaryColor,
				actionColor,
				largeLogo,
				privacyPolicy,
				termsOfUse,
				companyName,
				employeeCount,
				annualRevenue,
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
	<MerchantPageHeader title="Settings" description="Manage your store's settings and branding" />

	{#if !data.canEdit}
		<Card.Root class="border-yellow-200 bg-yellow-50">
			<Card.Content class="py-4">
				<div class="flex items-center gap-3">
					<AlertCircle class="h-5 w-5 text-yellow-600" />
					<p class="text-sm text-yellow-700">
						You have view-only access to these settings. Contact an owner to make
						changes.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if successMessage}
		<Card.Root class="border-green-200 bg-green-50">
			<Card.Content class="py-4">
				<div class="flex items-center gap-3">
					<CheckCircle class="h-5 w-5 text-green-600" />
					<p class="text-sm text-green-700">{successMessage}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if error}
		<Card.Root class="border-red-200 bg-red-50">
			<Card.Content class="py-4">
				<div class="flex items-center gap-3">
					<AlertCircle class="h-5 w-5 text-red-600" />
					<p class="text-sm text-red-700">{error}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Tabs Navigation -->
	<Tabs.Root bind:value={activeSection}>
		<Tabs.List>
			<Tabs.Trigger value="company">Company Info</Tabs.Trigger>
			<Tabs.Trigger value="branding">Brand Identity</Tabs.Trigger>
			<Tabs.Trigger value="legal">Terms & Privacy</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<!-- Tab Content -->
	{#if activeSection === 'company'}
		<div class="space-y-6">
			<CompanyInfoCard
				bind:companyName
				bind:employeeCount
				bind:annualRevenue
				bind:addressStreet
				bind:addressCity
				bind:addressState
				bind:addressPostalCode
				bind:addressCountry
				disabled={!data.canEdit}
			/>

			<MainContactCard
				bind:contactName
				bind:contactEmail
				bind:contactPhone
				disabled={!data.canEdit}
			/>
		</div>
	{:else if activeSection === 'branding'}
		<BrandIdentityCard
			bind:displayName
			bind:primaryColor
			bind:actionColor
			bind:largeLogo
			disabled={!data.canEdit}
			logoProxyUrl={`/merchant/${domain}/settings/api/logo-proxy`}
		/>
	{:else if activeSection === 'legal'}
		<LegalDocumentsCard bind:privacyPolicy bind:termsOfUse disabled={!data.canEdit} />
	{/if}
</div>

<!-- Sticky Save Button -->
{#if data.canEdit}
	<div
		class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm p-4 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:mt-6"
	>
		<div class="flex justify-end max-w-4xl mx-auto md:max-w-none">
			<Button
				onclick={saveSettings}
				disabled={saving || !hasChanges}
				class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
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
{/if}
