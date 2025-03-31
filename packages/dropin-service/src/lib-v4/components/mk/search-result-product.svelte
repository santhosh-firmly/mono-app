<script>
	// @ts-nocheck

	import { getSLDomain } from '$lib-v4/utils.js';

	export let highlighted = false;
	export let imageUrl = '';
	export let imagePosition = '';
	export let urlPrefix;
	export let urlSuffix;
	export let name = '';
	export let promoText = '';
	export let price;
	export let msrp;
</script>

<li>
	<a
		class="search-result"
		class:highlighted
		target="_top"
		href={`https://${urlPrefix}${getSLDomain(window.location.host)}${urlSuffix || ''}`}
	>
		<img
			src={imageUrl}
			alt={name}
			class="search-result-icon"
			loading="lazy"
			style="background-color:{'#fff'};object-position:{imagePosition ?? '50% 50%'}"
		/>
		<div>
			<span class="search-result-main-text">{name}</span>
			{#if promoText}
				<div class="search-result-sub-text-container">
					<img
						src="https://cdn-assets.affirm.com/vcn_buy/v1/merchants/RVZFG52AFOXPYRSL/logo2021101324/tag_logo_2x.png"
						alt={promoText}
						class="search-result-sub-icon"
						loading="lazy"
					/><span class="search-result-sub-text">{promoText}</span>
				</div>
			{/if}
		</div>
		{#if price}
			<div class="grow" />
			<div class="flex flex-row items-center gap-5">
				<div class="flex flex-row items-start">
					<span style="vertical-align: super;">$</span>
					<span style="vertical-align: text-top;" class="text-3xl">{parseInt(price.value)}</span>
					<span style="vertical-align: super;"
						>{parseInt((price.value - parseInt(price.value)) * 100)
							.toString()
							.padStart(2, '0')}</span
					>
				</div>
				{#if msrp?.value}
					<span style="text-decoration:line-through">$&nbsp;{msrp?.value?.toFixed?.(2)}</span>
				{/if}
			</div>
		{/if}
	</a>
</li>

<style>
	.search-result {
		align-items: center;
		color: var(--color-greyscale-black-70);
		cursor: pointer;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		height: 66px;
		padding: 4px 16px 6px;
		transition: background-color 0.1s ease;
	}
	.highlighted,
	.search-result:hover {
		background-color: #e7e9ea;
	}
	.search-result-icon {
		border-radius: 5px;
		margin-right: 8px;
		margin: 5px 5px 5px 0px;
		width: 99.5px;
		height: 56px;
		object-fit: cover;
	}
	.search-result-main-text {
		color: #202223;
		font-size: 17px;
		font-weight: 600;
	}
	.search-result-sub-text-container {
		align-items: center;
		display: flex;
	}
	.search-result-sub-icon {
		margin-right: 9px;
		width: 15px;
	}
	.search-result-sub-text {
		color: #57595a;
		font-size: 15px;
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
