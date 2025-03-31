<script lang="ts">
	// @ts-nocheck

	import MerchantLogo from './merchant-logo.svelte';

	export let featured = false;
	export let bgUrl = '';
	export let bgPosition = '';
	export let logoUrl = '';
	export let logoBg = '#fff';
	export let name = '';
	export let store;
	export let promoText = '';
	export let price;
	export let msrp;
	export let test;
</script>

<button class="merchant-card {featured ? 'merchant-card-featured' : ''}" on:click>
	<div class="merchant-card-bg w-full">
		<img
			class="merchant-card-bg-img"
			src={bgUrl}
			alt="background"
			loading="lazy"
			style="object-fit:cover;object-position:{bgPosition ?? '50% 50%'}"
		/>
		<div class="merchant-card-logo-wrapper">
			<MerchantLogo {name} {logoUrl} {logoBg} />
		</div>
		{#if test}
			<div class="c-corner-label z-[3]">
				<div class="c-corner-label__text">
					<p>DEMO</p>
				</div>
			</div>
		{/if}
	</div>
	<div class="merchant-card-info flex w-full flex-row justify-between">
		<div>
			<div class="merchant-card-info-label text-left">{name}</div>
			{#if store || promoText}
				<div class="merchant-card-twolines-container">
					{#if store}
						<span title={store}>{store}</span>
					{/if}
					{#if promoText}
						<svg viewBox="-267 469 24 24"
							><path
								d="M-245.3 469h-7.2c-1 0-2.1.4-2.8 1.2l-11 11c-.4.4-.7 1-.7 1.7 0 .6.2 1.2.7 1.6l7.8 7.8c.4.4 1 .7 1.6.7.6 0 1.2-.2 1.6-.7l11-11c.7-.7 1.2-1.7 1.2-2.8v-7.2c.1-1.3-.9-2.3-2.2-2.3zm.3 9.5c0 .5-.2 1-.6 1.4l-11 11c-.2.2-.3.1-.5 0l-7.9-7.9c-.1-.1-.1-.2-.1-.2 0-.1 0-.1.1-.2l11-11c.4-.4.9-.6 1.4-.6h7.2c.2 0 .3.1.3.3v7.2zm-5-5.5c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"
							/></svg
						>
						<span class="m-1" title={promoText}>
							{promoText}
						</span>
					{/if}
				</div>
			{/if}
		</div>
		<div class="mt-1 flex h-0 flex-col justify-start">
			{#if price !== undefined}
				<span class="font-semibold">$&nbsp;{price?.value?.toFixed?.(2)}</span>
			{/if}
			{#if msrp !== undefined}
				<span class="text-secondary pl-1 text-xs font-thin line-through"
					>$&nbsp;{msrp?.value?.toFixed?.(2)}</span
				>
			{/if}
		</div>
	</div>
</button>

<style lang="scss">
	.merchant-card {
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.merchant-card-featured {
		grid-column: 1/3;
		grid-row: 1/3;
	}
	.merchant-card-bg {
		flex-basis: 30px;
		border-radius: 4px;
		flex-grow: 1;
		margin-bottom: 8px;
		overflow: hidden;
		position: relative;
		width: 100%;
		z-index: 2;
	}
	.merchant-card-bg img {
		min-height: 100%;
		max-height: 100%;
		min-width: 100%;
		max-width: 100%;
		transition: transform 2s cubic-bezier(0.19, 1, 0.22, 1);
	}
	.merchant-card:hover .merchant-card-bg-img {
		transform: scale(1.1);
	}
	.merchant-card-logo-wrapper {
		left: 12px;
		bottom: 12px;
		position: absolute;
	}
	.merchant-card-info {
		flex-basis: 71px;
	}
	.merchant-card-info-label {
		font-family: Calibre, sans-serif;
		-webkit-font-smoothing: antialiased;
		font-size: 18px;
		font-weight: 600;
	}
	.merchant-card-twolines-container {
		align-items: flex-start;
		display: flex;
		flex-direction: row;
	}
	.merchant-card-twolines-container svg {
		margin-top: 3px;
		flex: 0 0 16px;
		height: 16px;
	}
	.merchant-card-twolines-container span {
		font-family: Calibre, sans-serif;
		-webkit-font-smoothing: antialiased;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		display: -webkit-box;
		white-space: break-spaces;
		color: #57595a;
		font-size: 15px;
		line-height: 22px;
		overflow: hidden;
		text-overflow: ellipsis;
		text-transform: none;
		font-weight: 400;
	}

	.c-corner-label {
		position: absolute;
		top: 0;
		right: 0;
		border-style: solid;
		border-color: #e63b39 rgba($color: #000000, $alpha: 0);
		transform: rotate(90deg);
		height: 0;
		width: 0;
		border-width: 50px 50px 0 0;
		transition: transform 2s cubic-bezier(0.19, 1, 0.22, 1);
	}
	.merchant-card:hover .c-corner-label {
		transform: rotate(90deg) scale(1.1);
	}
	.c-corner-label__text {
		color: #fcfcfc;
		font-size: calc(50px / 4.3);
		font-weight: bold;
		position: relative;
		left: calc(-50px * 0.35);
		top: calc(-50px * 0.65);
		white-space: nowrap;
		transform: rotate(-45deg);
		width: calc(50px * 1.4142);
		text-align: center;
		line-height: 0.1438em;
	}
</style>
