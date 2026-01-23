<script>
	import * as m from '$lib/paraglide/messages';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import IconC2p from '$lib/components/ui/icons/icon-c2p.svelte';
	import IconCcBrand from '$lib/components/ui/icons/icon-cc-brand.svelte';
	import UiFirmlyPowered from '$lib/components/ui/firmly-powered.svelte';
	import { getLuminance } from '$lib/utils/color-utils';
	import orderPlacedAnimation from '$lib/assets/order-placed-animation.json';

	/**
	 * @typedef {Object} ThankYouProps
	 * @property {Object} [order] - Order details including items, totals, and shipping
	 * @property {Object} [merchantInfo] - Merchant branding (logo, policies)
	 * @property {Object} [colors] - Theme colors (primary, action)
	 * @property {Function} [onClose] - Handler for continue shopping button
	 */

	/** @type {ThankYouProps} */
	let { order = {}, merchantInfo = {}, colors = {}, onClose = () => {} } = $props();

	let orderNumber = $derived(order?.platform_order_number || order?.id || 'N/A');
	let merchantName = $derived(order?.display_name || order?.shop_id || 'Merchant');
	let total = $derived(order?.total || order?.totals?.total || '0.00');
	let currency = $derived(order?.totals?.currency || '$');

	let shippingInfo = $derived({
		name: order?.shipping_info
			? `${order.shipping_info.first_name} ${order.shipping_info.last_name}`
			: '',
		address: order?.shipping_info?.address2
			? `${order.shipping_info.address1}, ${order.shipping_info.address2}, ${order.shipping_info.city}, ${order.shipping_info.state_or_province}, ${order.shipping_info.postal_code}`
			: order?.shipping_info
				? `${order.shipping_info.address1}, ${order.shipping_info.city}, ${order.shipping_info.state_or_province}, ${order.shipping_info.postal_code}`
				: '',
		phone: order?.shipping_info?.phone || '',
		email: order?.shipping_info?.email || ''
	});

	let paymentInfo = $derived({
		type: order?.payment_summary?.payment_type?.toLowerCase() || 'card',
		lastFour: order?.payment_summary?.last_four || '****',
		cardType: order?.payment_summary?.card_type || 'Card',
		first4: order?.payment_summary?.first_four || '',
		wallet: order?.payment_summary?.wallet || null,
		art: order?.payment_summary?.art || null
	});

	let isC2P = $derived(paymentInfo.wallet === 'c2p');
	let shippingMethod = $derived(order?.shipping_method?.description || 'Standard');
	let lineItems = $derived(order?.line_items || []);

	let primaryColor = $derived(colors?.primary || '#ffffff');
	let actionColor = $derived(colors?.action || '#333333');
	let textColor = $derived(getLuminance(primaryColor) > 0.5 ? '#000000' : '#ffffff');
	let mutedColor = $derived(
		getLuminance(primaryColor) > 0.5
			? 'color-mix(in srgb, #000000 50%, transparent)'
			: 'color-mix(in srgb, #ffffff 70%, transparent)'
	);

	let containerRef = $state(null);

	$effect(() => {
		if (containerRef && colors) {
			containerRef.style.setProperty('--color-primary', primaryColor);
			containerRef.style.setProperty('--color-action', actionColor);
			containerRef.style.setProperty('--color-text', textColor);
			containerRef.style.setProperty('--color-muted', mutedColor);
			containerRef.style.setProperty(
				'--color-on-action',
				getLuminance(actionColor) > 0.5 ? '#000000' : '#ffffff'
			);
		}
	});
</script>

<div
	bind:this={containerRef}
	class="@container flex size-full flex-col bg-white"
	style="--color-primary: {primaryColor}; --color-action: {actionColor};"
>
	<main
		class="flex flex-1 flex-col px-4 py-6 @3xl:mx-auto @3xl:w-full @3xl:max-w-2xl @3xl:px-0 @3xl:py-12"
	>
		<div class="flex flex-1 flex-col gap-6 @3xl:gap-8">
			<!-- Success Header -->
			<header class="flex flex-col items-center gap-3 text-center @3xl:gap-4">
				<div class="size-16 @3xl:size-20">
					<LottiePlayer
						src={orderPlacedAnimation}
						autoplay={true}
						loop={false}
						renderer="svg"
						background="transparent"
					/>
				</div>
				<div class="flex flex-col gap-1">
					<h1 class="text-text text-xl font-semibold @3xl:text-2xl">{m.thank_you()}</h1>
					<p class="text-muted text-sm">{m.order_placed_successfully()}</p>
				</div>
			</header>

			<!-- Order Card -->
			<section class="frosted overflow-hidden rounded-lg">
				<!-- Merchant Header -->
				<div class="border-b border-gray-100 px-4 py-3 @3xl:px-6 @3xl:py-4">
					{#if merchantInfo?.largeLogo}
						<img
							src={merchantInfo.largeLogo}
							alt="{merchantName} logo"
							class="h-5 object-contain @3xl:h-6"
						/>
					{:else}
						<span class="text-sm font-medium text-gray-900">{merchantName}</span>
					{/if}
				</div>

				<!-- Order Details -->
				<div class="flex flex-col gap-4 p-4 @3xl:gap-6 @3xl:p-6">
					<!-- Order Info Grid -->
					<div class="grid grid-cols-2 gap-y-3 @3xl:gap-y-4">
						<div class="flex flex-col gap-0.5">
							<span class="text-xs text-gray-500">{m.order_number()}</span>
							<span class="text-sm font-medium text-gray-900">{orderNumber}</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-xs text-gray-500">{m.order_total()}</span>
							<span class="text-sm font-medium text-gray-900">{currency}{total}</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-xs text-gray-500">{m.payment_method()}</span>
							<div class="flex items-center gap-1.5">
								{#if paymentInfo.type === 'paypal'}
									<Icon icon="logos:paypal" class="text-base" />
									<span class="text-sm font-medium text-gray-900">PayPal</span>
								{:else}
									{#if isC2P}
										<IconC2p width={28} height={15} />
										<div class="mx-0.5 h-4 w-px bg-gray-300"></div>
									{/if}
									<IconCcBrand
										first4={paymentInfo.first4}
										art={paymentInfo.art}
									/>
									<span class="text-sm font-medium text-gray-900">
										{paymentInfo.cardType} •••• {paymentInfo.lastFour}
									</span>
								{/if}
							</div>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-xs text-gray-500">{m.shipping_method()}</span>
							<span class="text-sm font-medium text-gray-900">{shippingMethod}</span>
						</div>
					</div>

					<!-- Shipping Address -->
					{#if shippingInfo.name || shippingInfo.email}
						<div class="border-t border-gray-100 pt-3 @3xl:pt-4">
							<div class="flex flex-col gap-0.5">
								<span class="text-xs text-gray-500">{m.shipping_address()}</span>
								<div class="flex flex-col text-sm text-gray-900">
									<div class="flex items-center gap-1">
										{#if shippingInfo.name}
											<span class="font-medium">{shippingInfo.name}</span>
										{/if}
										{#if shippingInfo.name && shippingInfo.email}
											<span>•</span>
										{/if}
										{#if shippingInfo.email}
											<span>{shippingInfo.email}</span>
										{/if}
									</div>
									{#if shippingInfo.address}
										<span class="text-gray-600">{shippingInfo.address}</span>
									{/if}
									{#if shippingInfo.phone}
										<span class="text-gray-600">{shippingInfo.phone}</span>
									{/if}
								</div>
							</div>
						</div>
					{/if}

					<!-- Line Items -->
					{#if lineItems.length > 0}
						<div class="border-t border-gray-100 pt-3 @3xl:pt-4">
							<span class="mb-2 block text-xs text-gray-500 @3xl:mb-3"
								>{m.order_summary()}</span
							>
							<div class="flex flex-col gap-2 @3xl:gap-3">
								{#each lineItems as item (item.id)}
									<div class="flex items-center gap-2 @3xl:gap-3">
										{#if item.image_url}
											<div
												class="size-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 @3xl:size-12"
											>
												<img
													src={item.image_url}
													alt={item.name}
													class="size-full object-cover"
												/>
											</div>
										{/if}
										<div class="flex flex-1 flex-col gap-0.5">
											<span class="text-sm font-medium text-gray-900"
												>{item.name}</span
											>
											<span class="text-xs text-gray-500"
												>{m.qty({ quantity: item.quantity })}</span
											>
										</div>
										<span class="text-sm font-medium text-gray-900">
											{item.price?.currency || '$'}{item.price?.value ||
												'0.00'}
										</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</section>

			<!-- Action Button -->
			<button
				onclick={onClose}
				class="bg-action text-on-action w-full rounded-md px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90"
			>
				{m.continue_shopping()}
			</button>
		</div>

		<!-- Footer -->
		<footer class="mt-auto flex justify-center pt-6">
			<UiFirmlyPowered />
		</footer>
	</main>
</div>
