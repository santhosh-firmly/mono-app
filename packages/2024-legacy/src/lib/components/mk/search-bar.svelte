<script>
	// @ts-nocheck

	// TODO: Add ARIA role to <div> with keydown handler
	/* eslint-disable svelte/valid-compile */

	import { Kbd } from 'flowbite-svelte';
	import { promotionalItems } from './data.js';
	import SearchResultsDropdown from './search-results-dropdown.svelte';
	import { onMount } from 'svelte';
	import { getSLDomain } from '$lib/utils.js';
	import { bindEvent } from '$lib/browser/dash.js';

	let resultsVisible = false;
	let headerExpanded = false;
	let inputElement;
	let searchBar;
	let highlighted = 0;
	let isMac = false;

	let storesResults;
	let productsResults = [];

	let delayTimer;
	let inputValue = '';

	let stickInPlace = false;

	export let transformOffset = 64;
	export let stickyWhenScrolled = true;
	export let alwaysSticky = false;
	export let isSticky;

	$: {
		isSticky = alwaysSticky || stickInPlace;
		if (typeof window !== 'undefined') {
			if (resultsVisible && !headerExpanded) {
				window.parent.postMessage({ action: 'firmly:expandHeader:trigger' }, '*');
				headerExpanded = true;
			} else if (!resultsVisible && headerExpanded) {
				window.parent.postMessage({ action: 'firmly:collapseHeader:trigger' }, '*');
				headerExpanded = false;
			}
		}
	}

	onMount(() => {
		isMac = window.navigator.platform?.startsWith?.('Mac');
		bindEvent(window, 'message', (e) => {
			if (e.data?.action === 'firmly::focusSearch') {
				inputElement.focus();
			}
		});
	});

	function handleKeyDown(ev) {
		if (ev.key === 'ArrowDown') {
			ev.preventDefault();
			if (!resultsVisible) {
				resultsVisible = true;
			} else if (storesResults && productsResults) {
				highlighted = (highlighted + 1) % (storesResults.length + productsResults.length);
			}
		}
		if (ev.key === 'ArrowUp') {
			ev.preventDefault();
			if (!resultsVisible) {
				resultsVisible = true;
			} else if (storesResults && productsResults) {
				highlighted = highlighted - 1;
				if (highlighted < 0) {
					highlighted = storesResults.length + productsResults.length - 1;
				}
			}
		}

		if (ev.key === 'Enter') {
			ev.preventDefault();
			if (!resultsVisible) {
				resultsVisible = true;
			} else if (storesResults && productsResults.length > 0) {
				const item = storesResults[highlighted] ?? productsResults[highlighted];
				window.top.location.href = `https://${item.merchantName}${getSLDomain(
					window.location.host
				)}${item.urlSuffix || ''}`;
			}
		}
		if (ev.key === 'Escape') {
			ev.preventDefault();
			resultsVisible = false;
			inputElement.blur();
		}
	}

	function handleInput() {
		productsResults = [];
		clearTimeout(delayTimer);
		delayTimer = setTimeout(searchForProducts, 300);
	}

	function searchForProducts(event) {
		const query = inputValue || event?.target?.value;
		const source = new EventSource(`${window.firmly.apiServer}/api/v1/dynamo/search?q=${query}`);
		source.onmessage = (event) => {
			if (event.data !== '[]' && event.data !== 'undefined') {
				productsResults = productsResults.concat(JSON.parse(event.data));
			}
		};

		source.onerror = (error) => {
			console.error('EventSource error:', error);
			source.close();
		};
	}
</script>

<svelte:window
	on:click={({ target }) => {
		if (!searchBar?.contains?.(target)) {
			resultsVisible = false;
		} else {
			resultsVisible = true;
		}
	}}
	on:keydown={(ev) => {
		if ((ev.key === 'k' && ev.metaKey) || (ev.key === 'k' && ev.ctrlKey)) {
			ev.preventDefault();
			inputElement.focus();
		}
	}}
	on:scroll={() => {
		if (!alwaysSticky && stickyWhenScrolled) {
			const { top } = searchBar.getBoundingClientRect();
			if (!stickInPlace && top <= transformOffset) {
				stickInPlace = true;
			} else if (stickInPlace && top > transformOffset) {
				stickInPlace = false;
			}
		}
	}}
/>

{#if resultsVisible}
	<div class="fixed top-0 left-0 w-full h-full backdrop-blur-2xl bg-black opacity-30 z-[51]" />
{/if}
{#if !alwaysSticky}
	<div class="container container-top">
		<div class="container-banner">
			<div class="cta-banner">
				<h2 class="imports-h1--5LJzc">Shop at thousands of stores</h2>
			</div>
		</div>
	</div>
{/if}
<div
	class="search-container"
	class:stick-in-place={isSticky}
	class:always-sticky={alwaysSticky}
	class:z-[51]={true}
>
	<div
		bind:this={searchBar}
		on:keydown|capture={handleKeyDown}
		class="search-bar z-[52]"
		aria-hidden="true"
	>
		<div class="relative">
			<div class="wrapper">
				<span class="mr-6">
					{#if isMac}
						<Kbd class="px-2 py-1.5">⌘</Kbd> + <Kbd class="px-2 py-1.5">K</Kbd>
					{:else}
						<Kbd class="px-2 py-1.5">Ctrl</Kbd> + <Kbd class="px-2 py-1.5">K</Kbd>
					{/if}
				</span>
				<span class="search-bar-icon-wrapper"
					><svg
						width="19"
						height="19"
						viewBox="0 0 19 19"
						fill="#101820"
						xmlns="http://www.w3.org/2000/svg"
						class="search-bar-icon"
						><path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M2.96 8.44c0-3.033 2.468-5.5 5.5-5.5 3.034 0 5.5 2.467 5.5 5.5s-2.466 5.5-5.5 5.5a5.506 5.506 0 0 1-5.5-5.5Zm15.708 8.793-4.25-4.25A7.454 7.454 0 0 0 15.96 8.44a7.5 7.5 0 1 0-7.5 7.5c1.71 0 3.282-.579 4.543-1.543l4.25 4.25a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414Z"
						/></svg
					></span
				>
			</div>
			<label class="search-label" for="SearchBar">STORES & PRODUCTS</label>
			<input
				bind:this={inputElement}
				bind:value={inputValue}
				autocomplete="off"
				on:focus={() => (resultsVisible = true)}
				on:input={(ev) => {
					resultsVisible = true;
					const searchValue = ev.target?.value?.trim?.()?.toLowerCase?.();
					if (searchValue?.length > 0) {
						storesResults = promotionalItems.filter(
							(s) => s.type === 'Store' && s.name.toLowerCase().includes(searchValue)
						);
						handleInput(ev);
					} else {
						storesResults = null;
					}
					highlighted = 0;
				}}
				type="text"
				placeholder="What are you looking for?"
				id="SearchBar"
			/>
		</div>
		<div class:hidden={!resultsVisible}>
			<SearchResultsDropdown
				{storesResults}
				{productsResults}
				{highlighted}
				extended={stickInPlace}
			/>
		</div>
	</div>
</div>
{#if !alwaysSticky}
	<div class="container container-bottom" />
{/if}

<style>
	.container {
		font-family: Calibre, sans-serif;
		-webkit-font-smoothing: antialiased;
		padding-left: 0;
		padding-right: 0;
		color: #101820;
		padding: 0;
		margin: 0 auto;
		max-width: 1224px;
		width: 85.89474%;
	}
	.container-top {
		padding-top: 80px;
	}
	.container-bottom {
		padding-bottom: 80px;
	}
	.container-banner {
		flex-direction: column;
		text-align: center;
		margin-bottom: 24px;
		align-items: center;
		display: flex;
		flex-wrap: nowrap;
	}
	.cta-banner {
		padding-left: 16px;
		padding-right: 16px;
		flex-grow: 1;
		width: auto;
	}
	.cta-banner h2 {
		margin-bottom: 0 !important;
		font-family: 'Mangueira', 'Calibre', sans-serif;
		font-size: 42px;
		font-weight: 700;
		line-height: 52px;
	}
	.search-container {
		font-family: Calibre, sans-serif;
		-webkit-font-smoothing: antialiased;
		padding-left: 16px;
		padding-right: 8px;
		text-align: left;
		margin: auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: all 0.3s ease;
	}
	.search-container.stick-in-place {
		position: sticky;
		top: 64px;
		padding-left: 0px;
		padding-right: 0px;
		padding-bottom: 12px;
	}
	.search-container.always-sticky {
		position: absolute;
	}
	.search-bar {
		position: relative;
		max-width: 808px;
		width: 85.89474%;
		transition: all 0.3s ease;
	}
	.stick-in-place .search-bar {
		max-width: 1224px;
	}
	.wrapper {
		position: absolute;
		display: flex;
		flex-direction: row;
		justify-items: center;
		align-items: center;
		right: 0px;
		top: 50%;
		transform: translateY(-50%);
	}
	.search-bar-icon-wrapper {
		position: relative;
		background: #4c7cec;
		border-radius: 50%;
		display: inline-block;
		height: 52px;
		overflow: visible;
		padding: 14px;
		width: 52px;
		right: 12px;
	}
	.stick-in-place .search-bar-icon-wrapper {
		height: 38px;
		width: 38px;
		right: 6px;
	}
	.search-bar-icon {
		fill: #fff;
		left: 50%;
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	.search-label {
		font-family: 'Calibre', sans-serif;
		color: #6d6e71;
		display: block;
		left: 36px;
		position: absolute;
		top: 12px;
		font-size: 16px;
		letter-spacing: 1.25px;
		line-height: 19px;
		font-weight: 600;
		text-transform: uppercase;
	}
	.stick-in-place .search-label {
		display: none;
	}
	.search-bar input {
		appearance: none;
		background-color: #fff;
		border: none;
		border-radius: 36px;
		box-shadow: 0 4px 8px rgba(6, 8, 9, 0.16);
		box-sizing: border-box;
		height: 73px;
		outline: 0;
		padding: 36px 56px 12px 34px;
		width: 100%;
		font-size: 18px;
		font-weight: 400;
		line-height: 26px;
		writing-mode: horizontal-tb !important;
	}
	.stick-in-place .search-bar input {
		border-radius: 30px;
		height: 48px;
		padding: 0px 24px 0px 24px;
		background-color: #fff;
	}
	.hidden {
		display: none;
	}
</style>
