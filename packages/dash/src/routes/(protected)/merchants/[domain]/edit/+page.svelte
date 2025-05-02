<script>
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Save } from 'lucide-svelte';
	import SidebarNav from '$lib/components/ui/sidebar-nav/sidebar-nav.svelte';

	import GeneralSection from './general.svelte';
	import AdvancedSection from './advanced.svelte';
	import PresentationSection from './presentation.svelte';
	import { onMount } from 'svelte';

	const navItems = [
		{ id: 'general', title: 'General' },
		{ id: 'presentation', title: 'Presentation' },
		{ id: 'advanced', title: 'Advanced' }
	];

	let { data } = $props();

	let activeSection = $state('general');
	let merchant = $state(data.merchant);
	let originalMerchantData = $state(JSON.stringify(data.merchant));
	let hasChanges = $state(false);
	let isSubmitting = $state(false);

	let pspOptions = $state();
	let platformOptions = $state();

	$effect(() => {
		const currentMerchant = JSON.stringify(merchant);
		hasChanges = originalMerchantData !== currentMerchant;
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
		try {
			console.log('Saving merchant:', merchant);
			originalMerchantData = JSON.stringify(merchant);
			hasChanges = false;
		} catch (error) {
			console.error('Error saving merchant:', error);
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
					<GeneralSection
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
					<PresentationSection {merchant} />
				{:else if activeSection === 'advanced'}
					<AdvancedSection {merchant} />
				{/if}
			</div>

			<!-- Centralized Save Button -->
			<Button
				on:click={saveMerchant}
				disabled={isSubmitting || !hasChanges}
				class="mb-4 mt-6 flex items-center gap-2"
			>
				<Save class="h-4 w-4" />
				{isSubmitting ? 'Saving...' : 'Save Changes'}
			</Button>
		</div>
	</div>
</div>
