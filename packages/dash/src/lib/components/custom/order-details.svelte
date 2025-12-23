<script>
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Package from 'lucide-svelte/icons/package';
	import Store from 'lucide-svelte/icons/store';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import Mail from 'lucide-svelte/icons/mail';
	import Phone from 'lucide-svelte/icons/phone';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import { formatDate } from 'date-fns';
	import CopyToClipboard from './copy-to-clipboard.svelte';

	function displayFromHash(hashedValue) {
		if (!hashedValue) return 'N/A';
		return hashedValue.replace(/-.*?-/, ' *** ').replace(/-.*?@/, '***@');
	}

	function getProductImage(item) {
		return item.image?.url;
	}

	export let order;

	let faviconError = false;
	let imageErrors = new Set();

	$: if (order) {
		faviconError = false;
		imageErrors = new Set();
	}

	function handleFaviconError() {
		faviconError = true;
	}

	function handleProductImageError(index) {
		imageErrors.add(index);
		imageErrors = imageErrors;
	}
</script>

<Card.Root class="overflow-hidden">
	<!-- Merchant Header -->
	<Card.Header class="bg-muted/50 pb-4">
		<div class="flex items-center gap-3">
			{#if !faviconError}
				<img
					src={`https://www.google.com/s2/favicons?sz=64&domain_url=${order?.shop_id}`}
					alt={order?.merchant_display_name || order?.shop_id}
					class="w-10 h-10 rounded-lg border bg-white object-cover shadow-sm"
					on:error={handleFaviconError}
				/>
			{:else}
				<div class="w-10 h-10 rounded-lg border bg-white flex items-center justify-center shadow-sm">
					<Store class="h-5 w-5 text-muted-foreground" />
				</div>
			{/if}
			<div class="flex-1 min-w-0">
				<Card.Title class="text-base font-semibold truncate">
					{order?.merchant_display_name || order?.shop_id || 'Store'}
				</Card.Title>
				<Card.Description class="text-xs truncate">
					{order?.shop_id}
				</Card.Description>
			</div>
			<Badge variant="outline" class="text-xs">
				{order?.status || 'Completed'}
			</Badge>
		</div>
	</Card.Header>

	<!-- Order Info -->
	<div class="px-6 py-3 border-b bg-background">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">#{order?.platform_order_number}</span>
				<CopyToClipboard value={order?.platform_order_number} />
			</div>
			<span class="text-xs text-muted-foreground">
				{order?.created_dt ? formatDate(order.created_dt, 'MMM dd, yyyy') : ''}
			</span>
		</div>
	</div>

	<Card.Content class="p-4 space-y-4">
		<!-- Order Items -->
		<div class="space-y-3">
			{#each order?.order_info?.line_items || [] as item, index (index)}
				<div class="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
					<!-- Product Image -->
					{#if getProductImage(item) && !imageErrors.has(index)}
						<div class="flex-shrink-0">
							<img
								src={getProductImage(item)}
								alt={item.description || item.name || 'Product'}
								class="w-14 h-14 object-cover rounded-md border shadow-sm"
								on:error={() => handleProductImageError(index)}
							/>
						</div>
					{:else}
						<div class="flex-shrink-0 w-14 h-14 bg-muted rounded-md border flex items-center justify-center">
							<Package class="h-6 w-6 text-muted-foreground" />
						</div>
					{/if}

					<!-- Product Details -->
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium truncate">
							{item.description || item.name || 'Item'}
						</p>
						<p class="text-xs text-muted-foreground">
							Qty: {item.quantity}
						</p>
					</div>

					<!-- Price -->
					<div class="text-right flex-shrink-0">
						<p class="text-sm font-medium">
							{formatCurrency(item.line_price?.value || item.line_price || 0)}
						</p>
					</div>
				</div>
			{/each}
		</div>

		<Separator />

		<!-- Order Summary -->
		<div class="space-y-1.5 text-sm">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Subtotal</span>
				<span>{formatCurrency(order?.order_info?.sub_total || 0)}</span>
			</div>
			{#if order?.order_info?.cart_discount?.value > 0}
				<div class="flex justify-between">
					<span class="text-muted-foreground">Discount</span>
					<span class="text-green-600">-{formatCurrency(order?.order_info?.cart_discount || 0)}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span class="text-muted-foreground">Shipping</span>
				<span>{formatCurrency(order?.order_info?.shipping_total || 0)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Tax</span>
				<span>{formatCurrency(order?.order_info?.tax || 0)}</span>
			</div>
			<Separator class="my-2" />
			<div class="flex justify-between font-semibold">
				<span>Total</span>
				<span>{formatCurrency(order?.order_info?.total || order?.order_total || 0)}</span>
			</div>
		</div>

		<Separator />

		<!-- Customer & Shipping Info (Compact) -->
		<div class="grid grid-cols-2 gap-4 text-xs">
			<!-- Shipping -->
			<div class="space-y-1.5">
				<div class="flex items-center gap-1.5 font-medium text-sm">
					<MapPin class="h-3.5 w-3.5" />
					Shipping
				</div>
				<address class="not-italic text-muted-foreground leading-relaxed">
					{order?.order_info?.shipping_info?.city || 'N/A'},
					{order?.order_info?.shipping_info?.state_or_province || ''}<br />
					{order?.order_info?.shipping_info?.postal_code || ''}
				</address>
			</div>

			<!-- Customer -->
			<div class="space-y-1.5">
				<div class="flex items-center gap-1.5 font-medium text-sm">
					<Mail class="h-3.5 w-3.5" />
					Customer
				</div>
				<div class="text-muted-foreground space-y-0.5">
					<p class="truncate">{displayFromHash(order?.order_info?.shipping_info?.email)}</p>
					<p>{displayFromHash(order?.order_info?.shipping_info?.phone)}</p>
				</div>
			</div>
		</div>

		<!-- Payment Info (Compact) -->
		{#if order?.order_info?.payment_summary}
			<div class="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
				<div class="flex items-center gap-2">
					<CreditCard class="h-4 w-4 text-muted-foreground" />
					<Badge variant="secondary" class="text-xs">
						{order.order_info.payment_summary.card_type || 'Card'}
					</Badge>
					{#if order?.order_info?.payment_summary?.last_four}
						<span class="text-muted-foreground font-mono text-xs">
							•••• {order.order_info.payment_summary.last_four}
						</span>
					{/if}
				</div>
			</div>
		{/if}
	</Card.Content>

	<Card.Footer class="flex flex-row items-center justify-end border-t bg-muted/50 px-6 py-3">
		<Button href="/orders/{order?.platform_order_number}" variant="default" size="sm" class="gap-1.5">
			<span>View Details</span>
			<ExternalLink class="h-3.5 w-3.5" />
		</Button>
	</Card.Footer>
</Card.Root>
