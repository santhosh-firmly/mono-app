<script>
	// @ts-nocheck
	import SearchResultStore from './search-result-store.svelte';
	import SearchResultProduct from './search-result-product.svelte';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';

	let resultsVisible = true;
	let resultElements = {};
	let scrollContainer;
	let extended = false;

	export let storesResults;
	export let productsResults;
	export let highlighted = 0;

	$: {
		if (resultElements[highlighted]) {
			scrollContainer?.scrollTo?.(
				0,
				resultElements[highlighted].offsetTop -
					scrollContainer.offsetHeight / 2 +
					resultElements[highlighted].offsetHeight / 2
			);
		}
	}
</script>

{#if resultsVisible && storesResults}
	<div class="search-results-container" bind:this={scrollContainer} class:extended>
		<div class="search-results-title">
			<span class="search-results-title-name">Stores</span><span class="search-results-title-count"
				>{storesResults.length}</span
			>
		</div>
		<ul aria-label="Search Results" role="listbox" id="search-results">
			{#each storesResults as result, index}
				<div bind:this={resultElements[index]}>
					<SearchResultStore
						name={result.name}
						logoUrl={result.logoUrl}
						logoBg={result.logoBg}
						urlPrefix={result.urlPrefix}
						urlSuffix={result.urlSuffix}
						promoText={result.promoText}
						highlighted={highlighted === index}
					/>
				</div>
			{/each}
		</ul>
		<div class="search-results-title">
			<span class="search-results-title-name">Products</span><span
				class="search-results-title-count">{productsResults.length}</span
			>
		</div>
		<ul aria-label="Search Results" role="listbox" id="search-results">
			{#each productsResults as result, index}
				<div bind:this={resultElements[(storesResults?.length ?? 0) + index]}>
					<SearchResultProduct
						name={result.name}
						imageUrl={result.image}
						imagePosition={result?.bgPosition}
						urlPrefix={result.merchantName}
						urlSuffix={result.urlSuffix}
						promoText={result?.promoText}
						price={result.price}
						msrp={result.msrp}
						highlighted={highlighted === (storesResults?.length ?? 0) + index}
					/>
				</div>
			{/each}
		</ul>
		{#if storesResults?.length === 0 && productsResults?.length === 0}
			<div class="flex flex-col items-center justify-center">
				<LottiePlayer
					width={150}
					height={150}
					class="h-full"
					src="/search-not-found.json"
					autoplay={true}
					loop={true}
					renderer="svg"
					background="transparent"
				/>
				<span class="text-sm font-semibold">No Results Found</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.search-results-container {
		background: #fff;
		border-radius: 6px;
		box-shadow: 0 4px 8px rgba(6, 8, 9, 0.16);
		margin-top: 4px;
		max-height: 50vh;
		overflow: auto;
		padding: 0;
		padding-bottom: 8px;
		position: absolute;
		scroll-behavior: smooth;
		width: 100%;
		z-index: 5;
	}
	.search-results-container.extended {
		max-height: 80vh;
	}
	.search-results-container > ul {
		padding-left: 0;
	}
	.search-results-title {
		z-index: 10;
		position: sticky;
		top: 0;
		background-color: #d6d6d6;
		font-size: 14px;
		padding-bottom: 7px;
		padding-left: 16px;
		padding-top: 7px;
	}
	.search-results-title-name {
		color: #101820;
		font-weight: 600;
		margin: 0 5px;
	}
	.search-results-title-count {
		color: #909293;
		font-size: 14px;
	}
</style>
