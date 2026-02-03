<script>
	import { getMockProduct, formatPrice } from '$lib/utils/configurator/mock-product.js';

	let { onBuyNow = () => {} } = $props();

	const sizes = ['S', 'M', 'L', 'XL'];
	const colors = [
		{ name: 'Black', value: '#1a1a1a' },
		{ name: 'Gray', value: '#9ca3af' },
		{ name: 'Navy', value: '#1e3a5f' }
	];

	let selectedSize = $state('M');
	let selectedColor = $state('#1a1a1a');

	const product = getMockProduct();
</script>

<div class="flex h-full flex-col bg-white">
	<div class="flex-1 overflow-auto">
		<div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
			<div class="mb-4 blur-[2px]">
				<div class="flex items-center gap-2 text-xs text-gray-400">
					<div class="h-3 w-10 rounded bg-gray-200"></div>
					<span>/</span>
					<div class="h-3 w-16 rounded bg-gray-200"></div>
					<span>/</span>
					<div class="h-3 w-20 rounded bg-gray-200"></div>
				</div>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:gap-8">
				<div
					class="flex shrink-0 items-center justify-center rounded-lg bg-gray-50 p-4 sm:p-6 md:w-1/2"
				>
					{#if product.image}
						<img
							src={product.image}
							alt={product.imageAlt}
							class="max-h-48 max-w-full object-contain sm:max-h-72"
						/>
					{/if}
				</div>

				<div class="flex flex-col gap-4">
					<div>
						<h1 class="text-lg font-semibold text-gray-900">{product.name}</h1>
						{#if product.variant}
							<p class="mt-1 text-sm text-gray-500">{product.variant}</p>
						{/if}
						<p class="mt-3 text-xl font-bold text-gray-900">
							{formatPrice(product.price, product.currency)}
						</p>
					</div>

					<div class="blur-[2px]">
						<div class="flex flex-col gap-2">
							<div class="h-3 w-full rounded bg-gray-100"></div>
							<div class="h-3 w-full rounded bg-gray-100"></div>
							<div class="h-3 w-2/3 rounded bg-gray-100"></div>
						</div>
					</div>

					<div>
						<span class="mb-2 block text-xs font-medium text-gray-700">Size</span>
						<div class="flex flex-wrap gap-2">
							{#each sizes as size (size)}
								<button
									type="button"
									onclick={() => (selectedSize = size)}
									class={[
										'flex h-8 w-14 items-center justify-center rounded-lg border text-xs font-medium transition-colors sm:w-16',
										selectedSize === size
											? 'border-gray-900 bg-gray-900 text-white'
											: 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
									]}
								>
									{size}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<span class="mb-2 block text-xs font-medium text-gray-700">Color</span>
						<div class="flex flex-wrap gap-2">
							{#each colors as color (color.value)}
								<button
									type="button"
									onclick={() => (selectedColor = color.value)}
									class={[
										'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
										selectedColor === color.value
											? 'border-gray-900'
											: 'border-transparent hover:border-gray-300'
									]}
									title={color.name}
								>
									<span
										class="h-6 w-6 rounded-full"
										style:background-color={color.value}
									></span>
								</button>
							{/each}
						</div>
					</div>

					<div class="flex flex-col gap-2 pt-2">
						<button
							type="button"
							onclick={() => onBuyNow(product)}
							class="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
							data-testid="buy-now-button"
						>
							Buy Now
						</button>
						<span class="text-center text-[10px] text-gray-400">
							Powered by Firmly
						</span>
					</div>
				</div>
			</div>

			<div class="mt-8 border-t border-gray-200 pt-6 sm:mt-10 sm:pt-8">
				<div class="mb-4 blur-[2px]">
					<div class="mb-3 h-5 w-40 rounded bg-gray-200"></div>
					<div class="flex flex-col gap-2">
						<div class="h-3 w-full rounded bg-gray-100"></div>
						<div class="h-3 w-full rounded bg-gray-100"></div>
						<div class="h-3 w-5/6 rounded bg-gray-100"></div>
						<div class="h-3 w-full rounded bg-gray-100"></div>
						<div class="h-3 w-3/4 rounded bg-gray-100"></div>
					</div>
				</div>

				<div class="blur-[2px]">
					<div class="mb-3 h-5 w-32 rounded bg-gray-200"></div>
					<div class="flex gap-4">
						<div class="h-20 w-20 rounded-lg bg-gray-100 sm:h-24 sm:w-24"></div>
						<div class="h-20 w-20 rounded-lg bg-gray-100 sm:h-24 sm:w-24"></div>
						<div class="h-20 w-20 rounded-lg bg-gray-100 sm:h-24 sm:w-24"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
