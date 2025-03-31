<script>
	// @ts-nocheck

	import { getSLDomain } from '$lib-v4/utils.js';

	export let highlighted = false;
	export let logoUrl = '';
	export let logoBg;
	export let urlPrefix;
	export let urlSuffix;
	export let name = '';
	export let promoText = '';
</script>

<li>
	<a
		class="search-result"
		class:highlighted
		target="_top"
		href={`https://${urlPrefix}${getSLDomain(window.location.host)}${urlSuffix || ''}`}
	>
		<img
			src={logoUrl}
			alt={name}
			class="search-result-icon p-1"
			loading="lazy"
			style="background-color:{logoBg || '#fff'}"
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
		border-radius: 50%;
		margin-right: 8px;
		margin: 5px 5px 5px 0px;
		width: 56px;
		height: 56px;
		object-fit: contain;
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
