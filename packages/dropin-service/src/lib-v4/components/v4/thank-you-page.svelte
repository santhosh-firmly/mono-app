<script>
	// @ts-nocheck
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import FooterLinks from './footer-links.svelte';
	import Header from './header.svelte';
	import { formatCurrency } from '$lib-v4/utils';
	import CreditCardDisplay from './credit-card-display.svelte';
	import { isPrimaryDark } from './theme-context';
	import { colord } from 'colord';
	import { onMount } from 'svelte';

	/**
	 * Order
	 */
	export let order = {};

	/**
	 * Merchant information to be used in the back button.
	 */
	export let merchantInfo = {
		smallLogo: '',
		largeLogo: ''
	};

	/**
	 * Merchant name
	 */
	let merchantName = '';

	/**
	 * Order number
	 */
	let orderNumber = '';

	/**
	 * Total cost of the current cart
	 */
	let total = null;

	/**
	 * ShippingInfo
	 */
	let shippingInfo = {
		name: '',
		address: '',
		phone: '',
		email: ''
	};

	/**
	 * Shipping Method
	 */
	let shippingMethod = '';

	/**
	 * Card information
	 */
	let wallet = {
		lastFour: '',
		cardType: ''
	};

	// Change the check mark animation colors according to the current theme.
	// Some of the colors in the template were captured below in order to make
	// it look good in light and dark themes
	let animationContainer;
	let animationBackground1Color = '0.203921571374, 0.780392169952, 0.349019616842, 1'; // Green
	let animationBackground2Color = '1, 1, 1, 1'; // White
	let animationTickmarkerColor = '1, 1, 1, 1'; // White

	onMount(() => {
		if ($isPrimaryDark) {
			const primaryColor = getComputedStyle(animationContainer).getPropertyValue('--fy-primary');
			const primaryColorRgb = colord(primaryColor).toRgb();
			animationBackground1Color = '1,1,1,1'; // White
			animationBackground2Color = `${primaryColorRgb.r / 255},${primaryColorRgb.g / 255},${primaryColorRgb.b / 255},1`;
			animationTickmarkerColor = animationBackground2Color;
		}
	});

	$: {
		if (order) {
			orderNumber = order.platform_order_number;

			shippingInfo = {
				name: `${order.shipping_info.first_name} ${order.shipping_info.last_name}`,
				address: order.shipping_info.address2
					? `${order.shipping_info.address1}, ${order.shipping_info.address2}, ${order.shipping_info.city}, ${order.shipping_info.state_or_province}, ${order.shipping_info.postal_code}`
					: `${order.shipping_info.address1}, ${order.shipping_info.city}, ${order.shipping_info.state_or_province}, ${order.shipping_info.postal_code}`,
				phone: order.shipping_info.phone,
				email: order.shipping_info.email
			};

			total = order.total;

			shippingMethod = order.shipping_method.description;

			if (order.payment_summary) {
				wallet = {
					lastFour: order.payment_summary.last_four,
					cardType: order.payment_summary.card_type
				};
			}

			merchantName = order.display_name || order.shop_id;
		}
	}
</script>

<div>
	<Header {merchantInfo} {merchantName} {total} itemCount={order.line_items.length} on:back-click />
</div>

<div class="bg-fy-primary flex w-full flex-col items-center justify-center gap-6 px-3 pt-16 pb-5">
	<div class="max-w-md">
		<div bind:this={animationContainer} class="flex flex-col items-center justify-center p-4">
			<LottiePlayer
				width={56}
				height={56}
				src={`{"v":"5.7.4","fr":40,"ip":0,"op":80,"w":400,"h":400,"nm":"process completed","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"tick","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[200,195.652,0],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":0,"k":[100,100,100],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-69.565,4.348],[-26.087,47.826],[69.565,-47.826]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[${animationTickmarkerColor || '0,0,0,1'}],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":26.087,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"tick","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"tm","s":{"a":0,"k":0,"ix":1},"e":{"a":1,"k":[{"i":{"x":[0.67],"y":[1]},"o":{"x":[0.75],"y":[0]},"t":45,"s":[0]},{"t":65,"s":[100]}],"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false}],"ip":0,"op":80,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"bg","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[200,200,0],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":1,"k":[{"i":{"x":[0.678,0.678,0.95],"y":[1,1,1]},"o":{"x":[1,1,1],"y":[0,0,0]},"t":32,"s":[0,0,100]},{"t":55,"s":[100,100,100]}],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[400,400],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[${animationBackground1Color || '1,1,1,1'}],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"bg","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":80,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"bg 2","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[200,200,0],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":1,"k":[{"i":{"x":[0.25,0.25,0.25],"y":[1,1,1]},"o":{"x":[0.33,0.33,0.33],"y":[0,0,0]},"t":27,"s":[0,0,100]},{"t":51,"s":[100,100,100]}],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[400,400],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[${animationBackground2Color || '1,1,1,1'}],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"bg","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":80,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"bg 3","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[200,200,0],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":1,"k":[{"i":{"x":[0.67,0.67,0.67],"y":[1,1,1]},"o":{"x":[1,1,0.75],"y":[0,0,0]},"t":5,"s":[0,0,100]},{"t":30,"s":[100,100,100]}],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[400,400],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[${animationBackground1Color || '0,0,0,1'}],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"bg","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":80,"st":0,"bm":0}],"markers":[]}`}
				autoplay={true}
				loop={false}
				renderer="svg"
				background="transparent"
			/>
		</div>
		<div class="flex flex-col items-center justify-center gap-3">
			<span class="text-fy-on-primary text-4xl font-medium"> Thank you! </span>
			<span class="text-fy-on-primary-subtle text-center text-sm font-normal">
				Merchant will send the order confirmation
			</span>
		</div>
	</div>
	<div
		class="bg-fy-surface flex w-full max-w-sm flex-col gap-4 divide-y rounded-lg border px-8 py-6 shadow-sm"
	>
		<div class="flex flex-col items-center justify-center gap-3">
			{#if merchantInfo?.largeLogo}
				<img
					class="inline h-4 align-middle"
					src={merchantInfo.largeLogo}
					alt="{merchantName} logo"
				/>
			{:else}
				<span class="text-lg">
					{merchantName}
				</span>
			{/if}
			<div class="text-fy-on-primary-subtle flex flex-row gap-2">
				<button class="text-xs font-semibold"> Contact </button>
				·
				<button class="text-xs font-semibold"> Returns </button>
				·
				<button class="text-xs font-semibold"> Terms </button>
			</div>
		</div>
		<div class="grid grid-cols-2 gap-4 pt-4">
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Merchant </span>
			<span class="text-end text-sm font-medium">
				{merchantName}
			</span>
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Order Number </span>
			<span class="text-end text-sm font-medium">
				{orderNumber}
			</span>
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Order Total </span>
			<span class=" text-end text-sm font-medium">
				{formatCurrency(total)}
			</span>
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Payment </span>
			<div class="flex flex-row justify-end text-sm">
				<CreditCardDisplay
					showOnlyLastFour={true}
					lastFour={wallet.lastFour}
					cardType={wallet.cardType}
				/>
			</div>
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Email </span>
			<span class="text-end text-sm font-medium">
				{shippingInfo.email}
			</span>
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Shipping to </span>
			<span class="-primary text-end text-sm font-medium">
				{shippingInfo.name} · {shippingInfo.address} · {shippingInfo.phone}
			</span>
			<span class="text-fy-on-primary-subtle text-start text-sm font-normal"> Method </span>
			<span class="text-end text-sm font-medium">
				{shippingMethod}
			</span>
		</div>
	</div>
	<div class="text-fy-on-primary-subtle pt-10 text-center text-xs">
		<FooterLinks />
	</div>
</div>
