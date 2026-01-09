<script>
	import { page } from '$app/stores';
	import { beforeNavigate, goto, invalidateAll } from '$app/navigation';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { AlertBanner } from '$lib/components/ui/alert-banner/index.js';
	import { StickyFormFooter } from '$lib/components/ui/sticky-form-footer/index.js';
	import KybStatusBanner from '$lib/components/merchant/kyb-status-banner.svelte';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Send from 'lucide-svelte/icons/send';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import {
		BrandIdentityCard,
		LegalDocumentsCard,
		CompanyInfoCard,
		MainContactCard
	} from '$lib/components/merchant-settings/index.js';

	let { data } = $props();

	let domain = $derived($page.params.domain);
	let fromOnboarding = $derived($page.url.searchParams.get('from') === 'onboarding');

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

	// KYB submission state
	let submittingKyb = $state(false);
	let kybError = $state('');
	let kybSuccessMessage = $state('');

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

	// Check if company info is sufficiently filled for KYB submission
	let canSubmitKyb = $derived(
		data.canEdit &&
			!hasChanges &&
			data.kybStatus?.kyb_status !== 'pending' &&
			data.kybStatus?.kyb_status !== 'approved' &&
			companyName?.trim() &&
			contactName?.trim() &&
			contactEmail?.trim()
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

	async function submitKYB() {
		if (!data.canEdit) return;

		submittingKyb = true;
		kybError = '';
		kybSuccessMessage = '';

		try {
			const response = await fetch(`/merchant/${domain}/api/kyb`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to submit KYB');
			}

			// If user came from onboarding, redirect back to merchant home
			if (fromOnboarding) {
				await goto(`/merchant/${domain}`);
				return;
			}

			kybSuccessMessage = 'Your information has been submitted for review.';

			// Refresh page data to update KYB status
			await invalidateAll();
		} catch (err) {
			kybError = err.message;
		} finally {
			submittingKyb = false;
		}
	}
</script>

<div class="space-y-6 pb-24 md:pb-6">
	<MerchantPageHeader title="Settings" description="Manage your store's settings and branding" />

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
			<!-- KYB Status Banners -->
			<KybStatusBanner kybStatus={data.kybStatus} />

			{#if kybError}
				<AlertBanner variant="error" message={kybError} />
			{/if}

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

			<!-- KYB Submit Button -->
			{#if data.canEdit && data.kybStatus?.kyb_status !== 'approved' && data.kybStatus?.kyb_status !== 'pending'}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg">Submit for Business Verification</Card.Title>
						<Card.Description>
							Once you've filled in your company and contact information, submit it
							for Firmly to review and verify your business.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Button
							onclick={submitKYB}
							disabled={submittingKyb || !canSubmitKyb || hasChanges}
							class="bg-purple-600 hover:bg-purple-700"
						>
							{#if submittingKyb}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							{:else}
								<Send class="mr-2 h-4 w-4" />
								Submit for Review
							{/if}
						</Button>
						{#if kybSuccessMessage}
							<div class="flex items-center gap-2 mt-3 text-green-600">
								<CheckCircle class="h-4 w-4" />
								<p class="text-sm">{kybSuccessMessage}</p>
							</div>
						{/if}
						{#if hasChanges}
							<p class="text-xs text-muted-foreground mt-2">
								Please save your changes before submitting.
							</p>
						{:else if !canSubmitKyb && data.kybStatus?.kyb_status !== 'pending' && data.kybStatus?.kyb_status !== 'approved'}
							<p class="text-xs text-muted-foreground mt-2">
								Please fill in company name, contact name, and contact email before
								submitting.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
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
	<StickyFormFooter onSave={saveSettings} disabled={!hasChanges} loading={saving} />
{/if}
