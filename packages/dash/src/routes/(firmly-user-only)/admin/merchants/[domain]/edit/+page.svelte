<script>
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Save } from 'lucide-svelte';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import SidebarNav from '$lib/components/ui/sidebar-nav/sidebar-nav.svelte';
	import OnboardingTasks from '$lib/components/merchant/onboarding-tasks.svelte';
	import IntegrationProgress from '$lib/components/merchant/integration-progress.svelte';

	import {
		GeneralSettings,
		PresentationSettings,
		AdvancedSettings
	} from '$lib/components/merchant-settings/index.js';
	import { onMount } from 'svelte';

	const navItems = [
		{ id: 'general', title: 'General' },
		{ id: 'presentation', title: 'Presentation' },
		{ id: 'advanced', title: 'Advanced' },
		{ id: 'onboarding', title: 'Onboarding' }
	];

	let { data } = $props();

	let activeSection = $state('general');
	let merchant = $state(data.merchant);
	let originalMerchantData = $state(JSON.stringify(data.merchant));
	let isSubmitting = $state(false);
	let saveError = $state('');
	let saveSuccess = $state('');

	let pspOptions = $state();
	let platformOptions = $state();

	// Track changes for merchant data only (onboarding is now read-only)
	let hasChanges = $derived(() => {
		const merchantChanged = JSON.stringify(merchant) !== originalMerchantData;
		return merchantChanged;
	});

	function handleSectionChange(section) {
		activeSection = section;
	}

	function addUrlName() {
		merchant.url_name = merchant.url ? [...merchant.url_name, ''] : [''];
	}

	function removeUrlName(index) {
		merchant.url_name = merchant.url_name.filter((_, i) => i !== index);
	}

	function updateUrlName(index, value) {
		const newUrls = [...merchant.url_name];
		newUrls[index] = value;
		merchant.url_name = newUrls;
	}

	function updateField(field, value) {
		merchant[field] = value;
	}

	async function saveMerchant() {
		isSubmitting = true;
		saveError = '';
		saveSuccess = '';

		try {
			// TODO: Save merchant data when backend is ready
			console.log('Saving merchant:', merchant);
			originalMerchantData = JSON.stringify(merchant);

			saveSuccess = 'Changes saved successfully';
		} catch (error) {
			console.error('Error saving:', error);
			saveError = error.message || 'Failed to save changes';
		} finally {
			isSubmitting = false;
		}
	}

	// Currency options - USD only
	const currencyOptions = [{ value: 'USD', label: 'USD - US Dollar' }];

	onMount(() => {
		pspOptions =
			data.pspOptions ||
			window.dash?.merchants?.columns?.psp?.map((item) => ({ label: item, value: item }));

		platformOptions =
			data.platformOptions ||
			window.dash?.merchants?.columns?.platform_id?.map((item) => ({
				label: item,
				value: item
			}));
	});
</script>

<div class="flex flex-col gap-6 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<!-- Header -->
	<div>
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Edit Merchant</h1>
				<p class="text-gray-500">Configure merchant settings and integrations</p>
			</div>
		</div>
		<Separator class="my-6" />
	</div>

	<!-- Content with Sidebar on lg -->
	<div class="flex flex-col gap-6 lg:flex-row lg:gap-12">
		<!-- Sidebar Navigation (visible on lg screens) -->
		<div class="hidden lg:block lg:w-1/5">
			<SidebarNav
				items={navItems}
				{activeSection}
				onSectionChange={handleSectionChange}
				class="sticky top-8"
			/>
		</div>

		<!-- Main Content -->
		<div class="max-w-4xl flex-1">
			<!-- Tabs Navigation (visible on mobile/tablet) -->
			<div class="mb-6 w-fit lg:hidden">
				<Tabs.Root value={activeSection} onValueChange={handleSectionChange}>
					<Tabs.List class="w-full">
						{#each navItems as item (item.id)}
							<Tabs.Trigger value={item.id}>{item.title}</Tabs.Trigger>
						{/each}
					</Tabs.List>
				</Tabs.Root>
			</div>

			<!-- Tab Content -->
			<div>
				{#if activeSection === 'general'}
					<GeneralSettings
						{merchant}
						{updateField}
						{addUrlName}
						{removeUrlName}
						{updateUrlName}
						{currencyOptions}
						{platformOptions}
						{pspOptions}
					/>
				{:else if activeSection === 'presentation'}
					<PresentationSettings {merchant} />
				{:else if activeSection === 'advanced'}
					<AdvancedSettings {merchant} />
				{:else if activeSection === 'onboarding'}
					<div class="space-y-6">
						<div>
							<h3 class="text-lg font-medium">Onboarding Status</h3>
							<p class="text-sm text-muted-foreground">
								View the onboarding status for this merchant. The "Complete
								integration" task will automatically update when all integration
								steps are completed.
							</p>
						</div>

						<div class="grid gap-6 lg:grid-cols-2">
							<!-- Onboarding Tasks -->
							<OnboardingTasks
								domain={data.domain}
								initialStatuses={data.onboardingProgress}
							/>

							<!-- Integration Progress -->
							<IntegrationProgress domain={data.domain} isFirmlyAdmin={true} />
						</div>

						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p class="text-sm text-blue-700">
								The "Complete integration" onboarding task automatically syncs with
								the integration progress. When all integration steps are marked as
								completed, the onboarding task will be marked as done. You can
								toggle individual integration steps using the Integration Progress
								panel above.
							</p>
						</div>
					</div>
				{/if}
			</div>

			{#if saveError}
				<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-sm text-red-700">{saveError}</p>
				</div>
			{/if}

			{#if saveSuccess}
				<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
					<p class="text-sm text-green-700">{saveSuccess}</p>
				</div>
			{/if}

			<!-- Centralized Save Button -->
			<Button
				on:click={saveMerchant}
				disabled={isSubmitting || !hasChanges()}
				class="mb-4 mt-6 flex items-center gap-2"
			>
				{#if isSubmitting}
					<Loader2 class="h-4 w-4 animate-spin" />
					Saving...
				{:else}
					<Save class="h-4 w-4" />
					Save Changes
				{/if}
			</Button>
		</div>
	</div>
</div>
