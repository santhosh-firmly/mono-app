<script lang="ts">
	// @ts-nocheck

	import { getSLDomain } from '$lib/utils.js';
	import { promotionalItems } from './data.js';
	import MasonryCard from './masonry-card.svelte';

	export let category: string | null;

	function handleCardClick({ urlPrefix, urlSuffix }) {
		window.top.location.href = `https://${urlPrefix}${getSLDomain(window.location.hostname)}:${
			window.location.port
		}${urlSuffix || ''}`;
	}
</script>

<section class="relative pb-[80px] pt-0">
	<div class="container">
		<div class="header">
			<div class="sections-header">
				<h2>We partner with the best</h2>
			</div>
			<div class="right-aligned-header">
				<span class="cursor-pointer"><span>See all featured stores & products</span></span>
			</div>
		</div>
	</div>
	<div class="merchants-collection-outer-container">
		<div class="merchants-collection-container">
			<div class="merchants-collection-merchant-grid">
				{#each promotionalItems.filter((s) => !category || s.category === category) as promotionalItem, index}
					<MasonryCard
						{...promotionalItem}
						featured={index === 0}
						on:click={() => {
							handleCardClick(promotionalItem);
						}}
					/>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		margin: auto;
		max-width: 1224px;
		width: 85.89474%;
	}
	.header {
		align-items: flex-end;
		display: flex;
		justify-content: flex-end;
	}
	.sections-header {
		text-align: left;
		width: 100%;
		margin: 0 auto;
	}
	.sections-header h2 {
		opacity: 1;
		transform: none;
		transition-delay: 0;
		margin-bottom: 0;
		transition:
			opacity 0.5s linear,
			transform 2s cubic-bezier(0.19, 1, 0.22, 1);
		font-family: Mangueira, Calibre, sans-serif;
		-webkit-font-smoothing: antialiased;
		font-weight: 700;
		font-size: 30px;
		line-height: 37px;
	}
	.right-aligned-header {
		flex-grow: 1;
		flex-shrink: 0;
		margin-left: 25px;
		text-align: right;
	}
	.right-aligned-header > span {
		cursor: pointer;
		transition: color 0.3s;
		color: #101820;
		display: inline-block;
		font-size: 16px;
		font-weight: 600;
		line-height: 19px;
		position: relative;
		text-decoration: none;
		text-transform: uppercase;
	}
	.right-aligned-header > span:hover {
		cursor: pointer;
		transition: color 0.3s;
		color: #4c7cec;
	}
	.right-aligned-header > span > span {
		font-family: Calibre, sans-serif;
		bottom: 4px;
		position: relative;
		text-transform: none;
	}
	.right-aligned-header > span:after {
		background-color: #4c7cec;
		bottom: 0;
		content: '';
		height: 2px;
		left: 0;
		position: absolute;
		transform: scaleX(0);
		width: 100%;
	}
	.right-aligned-header > span:hover:after {
		transform: none;
		animation: ButtonSecondary-underlineExpand--6dMzD 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53) 0s
			1 forwards;
		transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
	}

	/* Merchants Container */
	.merchants-collection-outer-container {
		margin: 0 auto;
		max-width: 1224px;
		width: 85.89474%;
	}
	.merchants-collection-container {
		margin: 0 auto;
		padding: 0;
		-webkit-overflow-scrolling: touch;
		-ms-overflow-style: none;
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
	}
	.merchants-collection-merchant-grid {
		-moz-column-gap: 24px;
		column-gap: 24px;
		display: grid;
		grid-auto-rows: 220px;
		grid-template-columns: repeat(4, minmax(150px, 500px));
		row-gap: 18px;
		margin-top: 24px;
	}
</style>
