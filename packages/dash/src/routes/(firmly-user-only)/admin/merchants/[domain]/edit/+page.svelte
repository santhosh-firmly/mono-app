<script>
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Save } from 'lucide-svelte';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import FileText from 'lucide-svelte/icons/file-text';
	import Upload from 'lucide-svelte/icons/upload';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
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
		{ id: 'onboarding', title: 'Onboarding' },
		{ id: 'agreement', title: 'Agreement' }
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

	// Agreement config state
	let agreementContentType = $state(data.agreementConfig?.contentType || 'default');
	let agreementMarkdown = $state(data.agreementConfig?.markdownContent || '');
	let agreementExternallySigned = $state(data.agreementConfig?.externallySigned || false);
	let agreementPdfKey = $state(data.agreementConfig?.pdfKey || null);
	let agreementPdfFile = $state(null);
	let agreementSaving = $state(false);
	let agreementError = $state('');
	let agreementSuccess = $state('');

	// Track original agreement config for change detection
	let originalAgreementConfig = $state({
		contentType: data.agreementConfig?.contentType || 'default',
		markdownContent: data.agreementConfig?.markdownContent || '',
		externallySigned: data.agreementConfig?.externallySigned || false,
		pdfKey: data.agreementConfig?.pdfKey || null
	});

	let hasAgreementChanges = $derived(() => {
		return (
			agreementContentType !== originalAgreementConfig.contentType ||
			agreementMarkdown !== originalAgreementConfig.markdownContent ||
			agreementExternallySigned !== originalAgreementConfig.externallySigned ||
			agreementPdfFile !== null
		);
	});

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

	function handlePdfFileChange(event) {
		const file = event.target.files?.[0];
		if (file && file.type === 'application/pdf') {
			agreementPdfFile = file;
			agreementError = '';
		} else if (file) {
			agreementError = 'Please select a valid PDF file';
			agreementPdfFile = null;
		}
	}

	async function saveAgreementConfig() {
		agreementSaving = true;
		agreementError = '';
		agreementSuccess = '';

		try {
			let body;
			let headers = {};

			if (agreementContentType === 'pdf' && agreementPdfFile) {
				// Use FormData for PDF upload
				const formData = new FormData();
				formData.append('pdf', agreementPdfFile);
				formData.append(
					'config',
					JSON.stringify({
						contentType: agreementContentType,
						externallySigned: agreementExternallySigned
					})
				);
				body = formData;
			} else {
				// Use JSON for non-PDF
				headers['Content-Type'] = 'application/json';
				body = JSON.stringify({
					contentType: agreementContentType,
					markdownContent: agreementContentType === 'markdown' ? agreementMarkdown : null,
					externallySigned: agreementExternallySigned
				});
			}

			const response = await fetch(`/admin/merchants/${data.domain}/agreement/api`, {
				method: 'PUT',
				headers,
				body
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to save agreement configuration');
			}

			// Update original config to reflect saved state
			originalAgreementConfig = {
				contentType: agreementContentType,
				markdownContent: agreementMarkdown,
				externallySigned: agreementExternallySigned,
				pdfKey: result.pdfKey || agreementPdfKey
			};
			agreementPdfKey = result.pdfKey || agreementPdfKey;
			agreementPdfFile = null;

			agreementSuccess = 'Agreement configuration saved successfully';
			setTimeout(() => {
				agreementSuccess = '';
			}, 3000);
		} catch (error) {
			agreementError = error.message;
		} finally {
			agreementSaving = false;
		}
	}

	async function resetAgreementToDefault() {
		agreementSaving = true;
		agreementError = '';

		try {
			const response = await fetch(`/admin/merchants/${data.domain}/agreement/api`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Failed to reset agreement');
			}

			// Reset all state
			agreementContentType = 'default';
			agreementMarkdown = '';
			agreementExternallySigned = false;
			agreementPdfKey = null;
			agreementPdfFile = null;
			originalAgreementConfig = {
				contentType: 'default',
				markdownContent: '',
				externallySigned: false,
				pdfKey: null
			};

			agreementSuccess = 'Agreement reset to default';
			setTimeout(() => {
				agreementSuccess = '';
			}, 3000);
		} catch (error) {
			agreementError = error.message;
		} finally {
			agreementSaving = false;
		}
	}

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
								statuses={data.onboardingProgress}
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
				{:else if activeSection === 'agreement'}
					<div class="space-y-6">
						<div>
							<h3 class="text-lg font-medium">Agreement Configuration</h3>
							<p class="text-sm text-muted-foreground">
								Configure the merchant agreement. You can use the default agreement,
								provide custom markdown content, or upload a PDF for
								externally-signed agreements.
							</p>
						</div>

						{#if agreementSuccess}
							<div
								class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg"
							>
								<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
								<p class="text-sm text-green-700 dark:text-green-400">
									{agreementSuccess}
								</p>
							</div>
						{/if}

						{#if agreementError}
							<div
								class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
							>
								<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
								<p class="text-sm text-red-700 dark:text-red-400">
									{agreementError}
								</p>
							</div>
						{/if}

						<Card.Root>
							<Card.Header>
								<Card.Title class="flex items-center gap-2">
									<FileText class="h-5 w-5" />
									Agreement Type
								</Card.Title>
								<Card.Description>
									Choose how the agreement is displayed to this merchant
								</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<div class="space-y-4">
									<label class="flex items-start space-x-3 cursor-pointer">
										<input
											type="radio"
											name="agreement-type"
											value="default"
											checked={agreementContentType === 'default'}
											onchange={() => (agreementContentType = 'default')}
											class="mt-1 h-4 w-4 text-primary border-border focus:ring-primary focus:ring-offset-background"
										/>
										<div class="space-y-1">
											<span class="font-medium text-foreground"
												>Default Agreement</span
											>
											<p class="text-sm text-muted-foreground">
												Use the standard Firmly merchant agreement
											</p>
										</div>
									</label>

									<label class="flex items-start space-x-3 cursor-pointer">
										<input
											type="radio"
											name="agreement-type"
											value="markdown"
											checked={agreementContentType === 'markdown'}
											onchange={() => (agreementContentType = 'markdown')}
											class="mt-1 h-4 w-4 text-primary border-border focus:ring-primary focus:ring-offset-background"
										/>
										<div class="space-y-1">
											<span class="font-medium text-foreground"
												>Custom Markdown</span
											>
											<p class="text-sm text-muted-foreground">
												Provide custom agreement content in Markdown format
											</p>
										</div>
									</label>

									<label class="flex items-start space-x-3 cursor-pointer">
										<input
											type="radio"
											name="agreement-type"
											value="pdf"
											checked={agreementContentType === 'pdf'}
											onchange={() => (agreementContentType = 'pdf')}
											class="mt-1 h-4 w-4 text-primary border-border focus:ring-primary focus:ring-offset-background"
										/>
										<div class="space-y-1">
											<span class="font-medium text-foreground"
												>PDF Document</span
											>
											<p class="text-sm text-muted-foreground">
												Upload a PDF for externally-signed or custom
												agreements
											</p>
										</div>
									</label>
								</div>

								{#if agreementContentType === 'markdown'}
									<div class="space-y-2 pt-4 border-t">
										<Label for="markdown-content">Markdown Content</Label>
										<Textarea
											id="markdown-content"
											bind:value={agreementMarkdown}
											placeholder="Enter your agreement content in Markdown format..."
											rows={15}
											class="font-mono text-sm"
										/>
										<p class="text-xs text-muted-foreground">
											Supports standard Markdown syntax including headings,
											lists, bold, italic, and links.
										</p>
									</div>
								{/if}

								{#if agreementContentType === 'pdf'}
									<div class="space-y-4 pt-4 border-t">
										<div class="space-y-2">
											<Label for="pdf-upload">Upload PDF</Label>
											<div
												class="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg"
											>
												<Upload class="h-8 w-8 text-muted-foreground" />
												<div class="flex-1">
													<input
														type="file"
														id="pdf-upload"
														accept=".pdf,application/pdf"
														onchange={handlePdfFileChange}
														class="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
													/>
													{#if agreementPdfFile}
														<p class="mt-2 text-sm text-green-600">
															Selected: {agreementPdfFile.name}
														</p>
													{:else if agreementPdfKey}
														<p
															class="mt-2 text-sm text-muted-foreground"
														>
															Current PDF: {agreementPdfKey
																.split('/')
																.pop()}
														</p>
													{/if}
												</div>
											</div>
										</div>

										<div
											class="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
										>
											<div class="space-y-0.5">
												<Label>Mark as Externally Signed</Label>
												<p class="text-sm text-muted-foreground">
													{#if agreementExternallySigned}
														Agreement will show as "Signed" without
														signature details
													{:else}
														Merchant will still need to accept this
														agreement in the dashboard
													{/if}
												</p>
											</div>
											<Switch bind:checked={agreementExternallySigned} />
										</div>
									</div>
								{/if}
							</Card.Content>
							<Card.Footer class="flex justify-between border-t px-6 py-4">
								{#if agreementContentType !== 'default' || originalAgreementConfig.contentType !== 'default'}
									<Button
										variant="outline"
										onclick={resetAgreementToDefault}
										disabled={agreementSaving}
									>
										Reset to Default
									</Button>
								{:else}
									<div></div>
								{/if}
								<Button
									onclick={saveAgreementConfig}
									disabled={agreementSaving || !hasAgreementChanges()}
								>
									{#if agreementSaving}
										<Loader2 class="mr-2 h-4 w-4 animate-spin" />
										Saving...
									{:else}
										<Save class="mr-2 h-4 w-4" />
										Save Agreement Config
									{/if}
								</Button>
							</Card.Footer>
						</Card.Root>
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
				onclick={saveMerchant}
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
