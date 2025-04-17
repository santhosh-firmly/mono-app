<script>
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SidebarNav from '$lib/components/ui/sidebar-nav/sidebar-nav.svelte';

	import GeneralSection from './general.svelte';
	import AdvancedSection from './advanced.svelte';

	let data;

	// Navigation items for sidebar
	const navItems = [
		{ id: 'general', title: 'General' },
		{ id: 'advanced', title: 'Advanced' }
	];

	// Track active section with Svelte 5 runes
	let activeSection = $state('general');

	// Create merchant state with Svelte 5 runes
	let merchant = $state(
		data?.merchant || {
			display_name: '',
			url_name: [],
			store_id: '',
			is_disabled: false,
			shop_currency: 'USD',
			platform_id: '',
			psp: '',
			base_url: '',
			store_info: {
				checkout_base_url: '',
				paypal: { clientId: '', merchantId: '' }
			}
		}
	);

	// Handle section change
	function handleSectionChange(section) {
		activeSection = section;
	}

	// Array helpers
	function addUrlName() {
		merchant.url_name = [...merchant.url_name, ''];
	}

	function removeUrlName(index) {
		merchant.url_name = merchant.url_name.filter((_, i) => i !== index);
	}

	function updateUrlName(index, value) {
		const newUrls = [...merchant.url_name];
		newUrls[index] = value;
		merchant.url_name = newUrls;
	}

	// Field update handlers
	function updateField(field, value) {
		merchant[field] = value;
	}

	// Save function
	function saveMerchant() {
		// Logic to save merchant data goes here
		console.log('Saving merchant:', merchant);
	}

	// Platform options
	const platformOptions = [
		{ value: 'plt', label: 'Pretty Little Thing' },
		{ value: 'shopify', label: 'Shopify' },
		{ value: 'magento', label: 'Magento' },
		{ value: 'custom', label: 'Custom' }
	];

	// PSP options
	const pspOptions = [
		{ value: 'plt-worldpay', label: 'PLT Worldpay' },
		{ value: 'stripe', label: 'Stripe' },
		{ value: 'paypal', label: 'PayPal' },
		{ value: 'adyen', label: 'Adyen' }
	];

	// Currency options - USD only
	const currencyOptions = [{ value: 'USD', label: 'USD - US Dollar' }];
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
		<div class="flex-1">
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
						{saveMerchant}
					/>
				{:else if activeSection === 'advanced'}
					<AdvancedSection {merchant} {saveMerchant} />
				{/if}
			</div>
		</div>
	</div>
</div>
