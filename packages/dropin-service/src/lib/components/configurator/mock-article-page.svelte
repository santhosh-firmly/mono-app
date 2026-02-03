<script>
	import { getMockProduct, formatPrice } from '$lib/utils/configurator/mock-product.js';

	let { onBuyNow = () => {}, merchantName = 'Demo Store', pdpEnabled = true } = $props();

	const product = getMockProduct();
</script>

<div class="flex h-full flex-col bg-white">
	<header class="flex items-center justify-between border-b border-gray-200 px-6 py-3">
		<span class="text-sm font-bold text-gray-900">{merchantName}</span>
		<div class="flex gap-4">
			<div class="h-3 w-12 rounded bg-gray-200 blur-[2px]"></div>
			<div class="h-3 w-10 rounded bg-gray-200 blur-[2px]"></div>
			<div class="h-3 w-14 rounded bg-gray-200 blur-[2px]"></div>
			<div class="h-3 w-8 rounded bg-gray-200 blur-[2px]"></div>
		</div>
	</header>

	<div class="flex-1 overflow-auto">
		<div class="h-40 w-full bg-gray-100 blur-[3px]">
			<div class="flex h-full items-center justify-center">
				<div class="flex flex-col items-center gap-2">
					<div class="h-5 w-48 rounded bg-gray-300"></div>
					<div class="h-3 w-64 rounded bg-gray-200"></div>
				</div>
			</div>
		</div>

		<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
			<div class="mb-6 blur-[2px]">
				<div class="mb-3 h-6 w-3/4 rounded bg-gray-200"></div>
				<div class="flex flex-col gap-2">
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-5/6 rounded bg-gray-100"></div>
				</div>
			</div>

			<div class="mb-6 blur-[2px]">
				<div class="flex flex-col gap-2">
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-4/5 rounded bg-gray-100"></div>
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-2/3 rounded bg-gray-100"></div>
				</div>
			</div>

			<div
				class="my-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:my-8"
			>
				<div class="flex flex-col">
					<div class="flex items-center justify-center bg-gray-50 p-4 sm:p-6">
						{#if product.image}
							<img
								src={product.image}
								alt={product.imageAlt}
								class="max-h-28 max-w-full object-contain sm:max-h-32"
							/>
						{/if}
					</div>
					<div class="flex flex-col gap-3 p-4 sm:p-5">
						<div>
							<h3 class="text-sm font-semibold text-gray-900">{product.name}</h3>
							{#if product.variant}
								<p class="mt-0.5 text-xs text-gray-500">{product.variant}</p>
							{/if}
							<p class="mt-2 text-base font-bold text-gray-900">
								{formatPrice(product.price, product.currency)}
							</p>
						</div>
						<button
							type="button"
							onclick={() => onBuyNow(product)}
							class="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
							data-testid={pdpEnabled ? 'see-product-button' : 'buy-now-button'}
						>
							{pdpEnabled ? 'See the Product' : 'Buy Now'}
						</button>
						<span class="text-center text-[10px] text-gray-400">
							Powered by Firmly
						</span>
					</div>
				</div>
			</div>

			<div class="mb-6 blur-[2px]">
				<div class="mb-3 h-5 w-1/2 rounded bg-gray-200"></div>
				<div class="flex flex-col gap-2">
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-3/4 rounded bg-gray-100"></div>
				</div>
			</div>

			<div class="mb-6 blur-[2px]">
				<div class="h-32 w-full rounded-lg bg-gray-100"></div>
			</div>

			<div class="blur-[2px]">
				<div class="flex flex-col gap-2">
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-5/6 rounded bg-gray-100"></div>
					<div class="h-3 w-full rounded bg-gray-100"></div>
					<div class="h-3 w-1/2 rounded bg-gray-100"></div>
				</div>
			</div>
		</div>
	</div>
</div>
