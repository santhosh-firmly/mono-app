<script lang="ts">
	// @ts-nocheck
	import { sCartHive, sDynamoConfig } from '$lib/browser/storage';
	import SearchBar from './search-bar.svelte';

	let headerContainer;

	let itemsTotalQuantity = 0;
	let isSearchBarSticky;

	// TODO: ESLint is saying BadgeType and its values are not being used.
	//       But they are being used below. Check why this is happening.
	/* eslint-disable no-unused-vars */
	enum BadgeType {
		LabelStyle,
		CircleStyle
	}
	/* eslint-enable */

	export let showBadgeWhenZero = false;
	export let showCartButton = true;
	export let alwaysStickySearchBar = false;
	export let badgeStyle = BadgeType.LabelStyle;
	export let logoOnly = false;

	$: {
		if ($sDynamoConfig) {
			showCartButton = $sDynamoConfig.show_cart_on_header;
		}
		if (showCartButton) {
			itemsTotalQuantity = $sCartHive?.total_quantity ?? 0;
		}
	}

	function handleClick() {
		window.firmly.sdk.CartUI.toggleCart();
	}
</script>

<div
	bind:this={headerContainer}
	class="top-box bg-white sticky top-0"
	class:top-box-shadow={true}
	class:extended={isSearchBarSticky}
>
	<div class="container">
		<a
			target="_top"
			href="/mk"
			aria-label="Firmly"
			class="header-logo flex flex-col justify-center h-[64px]"
		>
			<!-- <img class="h-[30px]" src="/marketplace-logo.png" alt="Market Place Logo" /> -->
			<!-- <img src="/marketplace-logo-text.png" alt="Market Place Logo Text" /> -->
			<img src="https://www.enervee.com/hubfs/Enervee-Logo-2024.svg" alt="Market Place Logo Text" />
		</a>
		{#if !logoOnly}
			<nav class="header-main" aria-label="Main">
				<div>
					<a target="_top" href="/mk" class="header-subnav"
						><span class="header-subnav-title header-subnav-link header-link">Deals</span>
					</a><span class="header-subnav"
						><span class="header-subnav-title header-subnav-link header-link">Ways to pay</span>
					</span><span class="header-subnav"
						><span class="header-subnav-title header-subnav-link header-link">Earn</span>
					</span><span class="header-subnav header-subnav-border"
						><span class="header-subnav-link header-link header-subnav-title"
							><span class="header-link header-link-2">For business</span></span
						>
					</span>
				</div>
				<div class="header-button-container">
					<span class="header-subnav header-right-subnav"
						><span class="header-subnav-title header-icon-link header-subnav-link"
							><svg
								width="18"
								height="20"
								viewBox="0 0 18 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								class="header-icon"
								><path
									clip-rule="evenodd"
									d="M8.999 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm-4 2.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM9 10.5c-4.294 0-7.5 2.807-7.5 5.963 0 .27.181.555.519.7 1.968.848 4.268 1.337 6.731 1.337 2.8 0 5.387-.632 7.517-1.703.161-.08.233-.219.233-.334 0-3.156-3.206-5.963-7.5-5.963Zm-9 5.963C0 12.205 4.181 9 9 9s9 3.205 9 7.463c0 .746-.452 1.37-1.06 1.675C14.591 19.318 11.772 20 8.75 20c-2.66 0-5.162-.528-7.324-1.459C.63 18.199 0 17.427 0 16.463Z"
								/></svg
							><span class="header-icon-link-text header-subnav-link header-link">Sign in</span
							></span
						>
						<div
							class="Header-subNavButtonLinks--6ucEl Header-subNavLinks--3JUQm"
							style="left: -91px;"
						/></span
					><span class="header-icon-link header-subnav-link header-right-subnav"
						><svg
							width="14"
							height="20"
							viewBox="0 0 14 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							class="header-icon"
							><path
								clip-rule="evenodd"
								d="M0 2.558A2.558 2.558 0 0 1 2.558 0l8.882.004a2.558 2.558 0 0 1 2.557 2.558v14.88A2.558 2.558 0 0 1 11.44 20l-8.882-.004A2.558 2.558 0 0 1 0 17.44V2.558Zm2.558-1.163c-.642 0-1.163.52-1.163 1.163v14.88c0 .643.52 1.163 1.163 1.163l8.882.004c.642 0 1.162-.52 1.162-1.163V2.562c0-.643-.52-1.163-1.162-1.163l-8.882-.004Z"
							/><circle cx="7" cy="16.001" r="1" /></svg
						><span class="header-icon-link-text header-subnav-link header-link">Download app</span
						></span
					>

					{#if showCartButton}
						<button
							class="relative header-icon-link header-subnav-link header-right-subnav"
							on:click={handleClick}
						>
							<div class="relative">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									class="mr-1"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g id="SVGRepo_iconCarrier">
										<path
											d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
											stroke="#4c7cec"
											stroke-width="1.5px"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</g>
								</svg>
								{#if showBadgeWhenZero || itemsTotalQuantity > 0}
									{#if badgeStyle === BadgeType.LabelStyle}
										<div class="badge relative">
											<p class="badge-text text-white absolute top-0">
												{itemsTotalQuantity > 99 ? 99 : itemsTotalQuantity}
											</p>
											<svg
												version="1.0"
												xmlns="http://www.w3.org/2000/svg"
												width="32px"
												height="32px"
												viewBox="0 0 1280.000000 1280.000000"
												preserveAspectRatio="xMidYMid meet"
											>
												<g
													transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
													fill="#f05252"
													stroke="none"
												>
													<path
														d="M4887 11756 c-55 -20 -112 -62 -140 -104 -13 -20 -348 -611 -745 -1313 -588 -1038 -724 -1285 -732 -1330 -7 -36 -9 -1401 -8 -4024 l3 -3970 33 -67 c39 -79 93 -129 169 -158 53 -20 74 -20 2933 -20 2859 0 2880 0 2933 20 76 29 130 79 169 158 l33 67 3 3970 c1 2623 -1 3988 -8 4024 -8 45 -144 292 -732 1330 -397 702 -732 1293 -745 1313 -28 42 -85 84 -140 104 -56 20 -2970 20 -3026 0z m1592 -1457 c95 -15 168 -44 244 -96 294 -200 331 -619 77 -873 -112 -112 -239 -164 -400 -164 -161 0 -288 52 -400 164 -333 332 -150 891 317 970 69 11 90 11 162 -1z"
													/>
												</g>
											</svg>
										</div>
									{:else}
										<div
											class="circle-badge absolute inline-flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 border-2 border-white rounded-full top-0 right-0 dark:border-gray-900"
										>
											{itemsTotalQuantity}
										</div>
									{/if}
								{/if}
							</div>
							<span class="header-icon-link-text header-subnav-link header-link">Cart</span>
						</button>
					{/if}

					<div class="header-lang-switcher-wrapper">
						<div
							class="header-lang-switcher"
							role="button"
							tabindex="0"
							aria-expanded="false"
							aria-label="Select language"
						>
							<span class="header-lang-switcher-label-inner"
								><div data-gatsby-image-wrapper="" class="header-lang-switcher-flag">
									<picture
										><source
											type="image/webp"
											sizes="(min-width: 24px) 24px, 100vw"
											srcset="https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=6&amp;h=6&amp;q=50&amp;fm=webp 6w,https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=12&amp;h=12&amp;q=50&amp;fm=webp 12w,https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=24&amp;h=24&amp;q=50&amp;fm=webp 24w,https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=48&amp;h=48&amp;q=50&amp;fm=webp 48w"
										/><img
											data-main-image=""
											style="opacity: 1;"
											sizes="(min-width: 24px) 24px, 100vw"
											decoding="async"
											loading="lazy"
											alt="The American flag"
											src="https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=24&amp;h=24&amp;q=50&amp;fm=png"
											srcset="https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=6&amp;h=6&amp;q=50&amp;fm=png 6w,https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=12&amp;h=12&amp;q=50&amp;fm=png 12w,https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=24&amp;h=24&amp;q=50&amp;fm=png 24w,https://images.ctfassets.net/4rc1asww3mw7/5BkSbOYcnHWds4kzGrfLdC/528d46ec5e7715a69c9c7079740f4774/USA.png?w=48&amp;h=48&amp;q=50&amp;fm=png 48w"
										/></picture
									>
								</div>
								USA</span
							>
						</div>
					</div>
				</div>
			</nav>
		{/if}
	</div>
</div>
{#if !logoOnly}
	<SearchBar
		transformOffset={headerContainer?.clientHeight}
		bind:isSticky={isSearchBarSticky}
		alwaysSticky={alwaysStickySearchBar}
	/>
{/if}

<style>
	.top-box {
		z-index: 51;
		box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.08);
		transition: height 3s ease;
	}

	.top-box.extended {
		height: 124px;
	}

	.header-logo {
		display: flex;
		align-items: center;
		justify-items: center;
		height: 31.94px;
		margin-right: 24px;
		width: 80px;
	}
	.container {
		align-items: center;
		display: flex;
		height: 64px;
		justify-content: space-between;
		margin: 0 auto;
		max-width: 1224px;
		width: 85.89474%;

		font-family: 'Calibre', sans-serif;
		-webkit-font-smoothing: antialiased;
		background-color: #fff;
		color: #101820;
		font-size: 18px;
		line-height: 26px;

		font-feature-settings: normal;
		font-kerning: auto;
		font-optical-sizing: auto;
		font-size: 16px;
		font-stretch: 100%;
		font-style: normal;
		font-variant-alternates: normal;
		font-variant-caps: normal;
		font-variant-east-asian: normal;
		font-variant-ligatures: normal;
		font-variant-numeric: normal;
		font-variation-settings: normal;
		font-weight: 600;
	}
	.header-main {
		align-items: center;
		display: flex;
		flex-shrink: 0;
	}
	.header-subnav {
		cursor: default;
		display: inline-block;
		margin: 0 18px;
		position: relative;
		z-index: 1;
	}
	.header-subnav-border {
		margin: 0 12px 0 6px;
		padding: 0 24px;
		position: relative;
	}
	.header-subnav-border:before {
		border-left: 1px solid #909293;
		border-right: 1px solid #909293;
		content: '';
		height: 20px;
		left: 0;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 100%;
	}
	.header-link {
		display: inline-block;
		font-size: 16px;
		margin: 0 18px;
		padding: 3px 0;
		position: relative;
		text-decoration: none;
		transition:
			color 0.2s linear,
			opacity 0.2s linear;
	}
	.header-link-2 {
		margin: 0;
		line-height: 0;
	}
	.header-link:after {
		background: #4c7cec;
		bottom: 0;
		content: '';
		height: 2px;
		left: 0;
		position: absolute;
		transform: scaleX(0);
		transition:
			background 0.25s,
			transform 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53);
		width: 100%;
	}
	.header-icon-link:hover .header-link:after {
		transform: none;
	}
	.header-subnav-link {
		display: inline-block;
		cursor: pointer;
		font-size: 16px;
		margin: 0 18px;
		padding: 3px 0;
		position: relative;
		text-decoration: none;
		transition:
			color 0.2s linear,
			opacity 0.2s linear;
	}
	.header-subnav-title {
		font-weight: 600;
		line-height: 24px;
		margin-left: 0;
		margin-right: 0;
	}
	.header-button-container {
		align-items: center;
		display: flex;
	}
	.header-lang-switcher-wrapper {
		margin-left: 12px;
	}
	.header-lang-switcher {
		font-size: 16px;
		line-height: 24px;
		padding: 6px 12px 6px 6px;
		align-items: center;
		display: flex;
		background-color: #f4f3f2;
		border-radius: 30px;
		color: #101820;
		cursor: pointer;
		font-weight: 600;
		justify-content: space-between;
		padding: 6px 12px 6px 6px;
		position: relative;
		transition: color 0.2s;
		width: 100%;
	}
	.header-lang-switcher-label-inner {
		align-items: center;
		display: flex;
	}
	.header-lang-switcher-flag {
		margin-right: 8px;
		display: inline-block;
		vertical-align: top;
		position: relative;
		overflow: hidden;
	}
	.header-icon-link {
		font-weight: 600;
		align-items: center;
		color: #4c7cec;
		display: flex;
	}
	.header-icon-link-text {
		margin: 0;
	}
	.header-icon {
		fill: #4c7cec;
		margin-right: 8px;
	}
	.header-right-subnav {
		margin: 0 12px;
	}

	/* Cart badge */
	.circle-badge {
		transform: translateX(25%) translateY(-40%);
	}
	.badge {
		position: absolute;
		margin-top: -21px;
		margin-left: 20px;
		top: 0px;
		transform: rotate(-105deg);
	}
	.badge svg {
		z-index: -1;
	}
	.badge-text {
		font-family: 'Calibre', sans-serif;
		-webkit-font-smoothing: antialiased;
		width: 100%;
		/* height: 100%; */
		line-height: 1;
		text-align: center;
		text-align: center;
		transform: rotate(90deg) translateX(11px);
	}
</style>
