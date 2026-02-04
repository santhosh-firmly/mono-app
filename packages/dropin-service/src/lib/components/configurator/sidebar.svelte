<script>
	import { tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import RequestList from './request-list.svelte';
	import PanelToggle from './panel-toggle.svelte';
	import PanelSelect from './panel-select.svelte';
	import PanelColorPicker from './panel-color-picker.svelte';

	/**
	 * @typedef {Object} ConfiguratorSidebarProps
	 * @property {Object} configurator - Configurator state with theme, features, requests
	 * @property {boolean} [disabled] - Hide the sidebar
	 */

	/** @type {ConfiguratorSidebarProps} */
	let { configurator, disabled = false } = $props();

	let editingName = $state(false);
	let nameInputRef = $state(null);

	let activePanel = $state(null);

	const navItems = [
		{ id: 'theme', icon: 'mdi:palette-outline', label: 'Theme' },
		{ id: 'settings', icon: 'mdi:cog-outline', label: 'Settings' },
		{ id: 'requests', icon: 'mdi:swap-horizontal', label: 'Requests' }
	];

	const productOptions = [
		{ value: 'checkout', label: 'Checkout' },
		{ value: 'buyNow', label: 'Buy Now' }
	];

	let isBuyNow = $derived(configurator.product === 'buyNow');

	const panelDescriptions = {
		theme: 'Customize the checkout appearance with colors and branding.',
		settings: 'Configure mode, layout and feature availability.',
		requests: 'Interact with the checkout to see the requests.'
	};

	const languageLabels = {
		en: 'English',
		'pt-br': 'Português (BR)'
	};

	const layoutOptions = [
		{ value: 'sidebar', label: 'Sidebar' },
		{ value: 'popup', label: 'Popup' },
		{ value: 'bottomsheet', label: 'Bottom Sheet' },
		{ value: 'fullscreen', label: 'Fullscreen' }
	];

	let languageOptions = $derived(
		configurator.availableLanguages.map((lang) => ({
			value: lang,
			label: languageLabels[lang] || lang
		}))
	);

	let requestCount = $derived(configurator.allRequests?.length || 0);

	function togglePanel(id) {
		activePanel = activePanel === id ? null : id;
	}
</script>

{#if !disabled}
	<aside class="flex h-full" transition:slide={{ axis: 'x', duration: 200 }}>
		<nav
			class="flex w-14 flex-col items-center gap-1 border-r border-gray-200 bg-white px-2 py-3"
		>
			{#each navItems as item (item.id)}
				<button
					type="button"
					onclick={() => togglePanel(item.id)}
					class={[
						'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
						activePanel === item.id
							? 'bg-gray-100 text-gray-900'
							: 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
					]}
					title={item.label}
				>
					<Icon icon={item.icon} class="text-xl" />
					{#if activePanel === item.id}
						<span
							class="absolute top-1/2 -right-2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gray-900"
						></span>
					{/if}
					{#if item.id === 'requests' && requestCount > 0 && activePanel !== 'requests'}
						<span
							class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-medium text-white"
						>
							{requestCount > 99 ? '99+' : requestCount}
						</span>
					{/if}
				</button>
			{/each}
		</nav>

		{#if activePanel}
			<div class="flex w-80 flex-col border-r border-gray-200 bg-white">
				<header class="flex flex-col gap-1 border-b border-gray-200 px-4 py-3">
					<h2 class="text-sm font-semibold text-gray-900">
						{navItems.find((item) => item.id === activePanel)?.label}
					</h2>
					<p class="text-xs text-gray-500">{panelDescriptions[activePanel]}</p>
				</header>

				<div class="flex-1 overflow-y-auto p-4">
					{#if activePanel === 'requests'}
						<RequestList
							requests={configurator.allRequests}
							defaultDelay={configurator.defaultDelay}
							autoAccept={configurator.autoAccept}
							onAccept={(id) => configurator.acceptRequest(id)}
							onReject={(id) => configurator.rejectRequest(id)}
							onDelayChange={(ms) => configurator.setDelay(ms)}
							onAutoAcceptChange={(val) => (configurator.autoAccept = val)}
							onClear={() => configurator.clearHistory()}
						/>
					{:else if activePanel === 'settings'}
						<div class="flex flex-col gap-4">
							<section class="flex flex-col gap-2">
								<div
									class="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-gray-400"
								>
									<Icon icon="mdi:tune" class="text-xs" />
									<span>GENERAL</span>
								</div>
								<h3 class="text-xs font-semibold text-gray-900">Mode</h3>
								<PanelSelect
									value={configurator.product}
									options={productOptions}
									onchange={(product) => configurator.setProduct(product)}
								/>
							</section>

							<div class="h-px bg-gray-200"></div>

							{#if isBuyNow}
								<div class="flex flex-col gap-3">
									<div
										class="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-gray-400"
									>
										<Icon icon="mdi:shopping-outline" class="text-xs" />
										<span>BUY NOW</span>
									</div>
									<section class="flex flex-col gap-2">
										<h3 class="text-xs font-semibold text-gray-900">
											Layout Type
										</h3>
										<PanelSelect
											value={configurator.layoutType}
											options={layoutOptions}
											onchange={(type) => configurator.setLayoutType(type)}
										/>
									</section>
									<div
										class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
									>
										<span class="text-xs text-gray-700">Product Page</span>
										<PanelToggle
											checked={configurator.pdpEnabled}
											onchange={(val) => configurator.setPdpEnabled(val)}
										/>
									</div>
								</div>

								<div class="h-px bg-gray-200"></div>
							{/if}

							<div class="flex flex-col gap-3">
								<div
									class="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-gray-400"
								>
									<Icon icon="mdi:credit-card-outline" class="text-xs" />
									<span>CHECKOUT</span>
								</div>
								<section class="flex flex-col gap-2">
									<h3 class="text-xs font-semibold text-gray-900">Language</h3>
									<PanelSelect
										value={configurator.language}
										options={languageOptions}
										onchange={(lang) => configurator.setLanguage(lang)}
									/>
								</section>
								<section class="flex flex-col gap-2">
									<h3 class="text-xs font-semibold text-gray-900">Features</h3>
									<div
										class="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
									>
										<div class="flex items-center justify-between">
											<span class="text-xs text-gray-700">Promo Codes</span>
											<PanelToggle
												checked={configurator.features.promoCodes}
												onchange={(val) =>
													configurator.setFeature('promoCodes', val)}
											/>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-xs text-gray-700">PayPal</span>
											<PanelToggle
												checked={configurator.features.paypal}
												onchange={(val) =>
													configurator.setFeature('paypal', val)}
											/>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-xs text-gray-700">Click to Pay</span>
											<PanelToggle
												checked={configurator.features.clickToPay}
												onchange={(val) =>
													configurator.setFeature('clickToPay', val)}
											/>
										</div>
									</div>
								</section>
							</div>
						</div>
					{:else if activePanel === 'theme'}
						<div class="flex flex-col gap-4">
							<section class="flex flex-col gap-2">
								<h3 class="text-xs font-semibold text-gray-900">Presets</h3>
								<div class="flex flex-wrap gap-2">
									{#each configurator.themePresets as preset (preset.id)}
										<button
											type="button"
											onclick={() => configurator.applyPreset(preset.id)}
											class="flex items-center gap-1 rounded-md border border-gray-200 bg-white py-1.5 pr-3 pl-1.5 text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
										>
											<div
												class="flex h-4 overflow-hidden rounded border border-gray-300"
											>
												<span
													class="w-4"
													style:background-color={preset.primaryColor}
												></span>
												<span
													class="w-4 border-l border-gray-300"
													style:background-color={preset.actionColor}
												></span>
											</div>
											{preset.name}
										</button>
									{/each}
								</div>
							</section>
							<section class="flex flex-col gap-3">
								<h3 class="text-xs font-semibold text-gray-900">Branding</h3>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-700">Merchant Name</span>
									{#if editingName}
										<input
											bind:this={nameInputRef}
											type="text"
											value={configurator.theme.merchantName}
											onblur={(e) => {
												configurator.setTheme(
													'merchantName',
													e.target.value
												);
												editingName = false;
											}}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													configurator.setTheme(
														'merchantName',
														e.target.value
													);
													editingName = false;
												}
												if (e.key === 'Escape') {
													editingName = false;
												}
											}}
											class="w-32 rounded border border-gray-200 px-2 py-1 text-xs text-gray-900 focus:border-gray-400 focus:outline-none"
										/>
									{:else}
										<button
											type="button"
											onclick={async () => {
												editingName = true;
												await tick();
												nameInputRef?.focus();
											}}
											class="text-xs text-gray-900 hover:text-gray-600"
										>
											{configurator.theme.merchantName}
										</button>
									{/if}
								</div>
								<div class="flex items-center justify-between gap-2">
									<span class="text-xs text-gray-700">Logo</span>
									<div class="flex flex-1 items-center justify-end gap-2">
										{#if configurator.theme.largeLogo}
											<img
												src={configurator.theme.largeLogo}
												alt="Logo"
												class="h-5 max-w-24 object-contain"
											/>
										{:else}
											<span class="text-xs text-gray-400">No logo</span>
										{/if}
									</div>
								</div>
							</section>
							<section class="flex flex-col gap-3">
								<h3 class="text-xs font-semibold text-gray-900">Colors</h3>
								<PanelColorPicker
									label="Primary"
									value={configurator.theme.primaryColor}
									onchange={(color) =>
										configurator.setTheme('primaryColor', color)}
								/>
								<PanelColorPicker
									label="Action"
									value={configurator.theme.actionColor}
									onchange={(color) =>
										configurator.setTheme('actionColor', color)}
								/>
							</section>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</aside>
{/if}
