<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	let asSideBar = false;

	const sideBarClasses = 'right-0 h-full';
	const floatingClasses = 'right-10 top-10 bottom-10 rounded-2xl';

	export let checkoutWindow;
	export let iconEnabled = false;
	export let icon = 'https://avatars.githubusercontent.com/u/16349546?s=200&v=4';
	// export let icon =
	// 	'https://play-lh.googleusercontent.com/Ixz3swWSG-7Z9Xwdl7KTdATbuzn2zZ3LNfom7sNfHfVI75OKURFemrDcCU3eHTF-b7k=w240-h480-rw';
	export let largeLogoEnabled = true;
	export let largeLogo =
		// 'https://s3.amazonaws.com/blab-impact-published-production/Lpd2M3A7ZPduOSo3jiIdZQHM2fptUo3H';
		'https://havaianas.com/on/demandware.static/Sites-Havaianas-US-Site/-/default/dwe09e71e9/images/logo.svg';
	export let name = 'Havaianas';
	let editingName = false;

	let shopPayEnabled;
	let payPalEnabled;
	let loginEnabled;
	let shippingEnabled = true;

	let primaryColor = '#ffffff';
	let actionColor = '#000000';

	const states = [
		'Blank',
		'Skeleton',
		'Updt Ship',
		'Updt Method',
		'Placing Order',
		// 'Login',
		// 'Click to Pay',
		'Thank You'
	];

	let currentState = states[0];

	function sendMessage() {
		if (checkoutWindow) {
			checkoutWindow.contentWindow.postMessage({
				from: 'firmly-configurator',
				state: currentState,
				largeLogo: largeLogoEnabled ? largeLogo : null,
				smallLogo: iconEnabled ? icon : null,
				name,
				shopPayEnabled,
				payPalEnabled,
				loginEnabled,
				shippingEnabled,
				primaryColor,
				actionColor
			});
		}
	}

	function onStateChange(event) {
		currentState = event.target.value;
		sendMessage();
	}

	function startupListener() {
		sendMessage();
	}

	onMount(() => {
		window.addEventListener('message', startupListener);
		sendMessage();

		return () => {
			window.removeEventListener('message', startupListener);
		};
	});

	function init(el) {
		el.focus();
	}
</script>

<!-- This is for a side bar -->
<aside
	class="fixed shadow-2xl p-4 bg-zinc-50 dark:bg-zinc-800 dark:text-white w-[300px] z-20 overflow-scroll {asSideBar
		? sideBarClasses
		: floatingClasses}"
>
	<div class="text-sm text-gray-500 dark:text-gray-300 text-center">
		Customize the look & feel of Firmly Edge on your website.
	</div>
	<hr class="m-4" />
	<div>
		<h3 class="text-sm font-bold px-1 pb-2">State</h3>
		<ul class="w-full flex flex-row flex-wrap gap-3 p-2 justify-center">
			{#each states as state}
				<li>
					<input
						type="radio"
						id={state}
						name="state"
						value={state}
						class="hidden peer"
						on:change={onStateChange}
						checked={currentState === state}
						required
					/>
					<label
						for={state}
						class="inline-flex items-center justify-between w-full p-2 px-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-red-500 peer-checked:border-red-600 peer-checked:text-red-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
					>
						<div class="block text-center w-full">
							<div class="w-full text-xs peer-checked:font-semibold">{state}</div>
						</div>
					</label>
				</li>
			{/each}
		</ul>
	</div>
	<hr class="m-4" />
	<div>
		<h3 class="text-sm font-bold px-1 pb-4">Appearance</h3>
		<div class="flex flex-row items-center py-2 px-4 h-12 justify-between">
			<span class="text-xs font-medium">Name</span>
			{#if editingName}
				<input
					class="text-xs p-1 text-black"
					class:hidden={!editingName}
					bind:value={name}
					on:blur={() => {
						editingName = false;
						sendMessage();
					}}
					on:keydown={(event) => {
						if (event.key === 'Enter') {
							editingName = false;
							sendMessage();
						}
					}}
					use:init
				/>
			{:else}
				<button
					class="text-xs"
					on:click={() => {
						editingName = true;
					}}>{name}</button
				>
			{/if}
		</div>
		<div class="flex flex-row items-center py-2 px-4 h-12 gap-2">
			<span class="text-xs font-medium">Icon </span>
			<label class="relative inline-flex items-center cursor-pointer">
				<input
					bind:checked={iconEnabled}
					on:change={sendMessage}
					type="checkbox"
					value=""
					class="sr-only peer"
				/>
				<div
					class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
				></div>
			</label>
			<div class="grow" />
			<img class="h-6 rounded-full" src={icon} alt="Icon" />
		</div>
		<div class="flex flex-row items-center py-2 px-4 h-12 gap-2">
			<span class="text-xs font-medium">Logo</span>
			<label class="relative inline-flex items-center cursor-pointer">
				<input
					bind:checked={largeLogoEnabled}
					on:change={sendMessage}
					type="checkbox"
					value=""
					class="sr-only peer"
				/>
				<div
					class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
				></div>
			</label>
			<div class="grow" />
			<img class="h-4 dark:grayscale dark:invert" src={largeLogo} alt="Logo" />
		</div>
		<div class="flex flex-row items-center py-2 px-4 h-12 justify-between">
			<span class="text-xs font-medium">Brand color</span>
			<label
				class="rounded-lg overflow-hidden flex flex-row items-center shadow border"
				style="border-color: {primaryColor};"
			>
				<input type="color" class="sr-only" bind:value={primaryColor} on:input={sendMessage} />
				<div type="color" class="w-8 h-8" style="background-color: {primaryColor};" />
				<span class="px-2 text-xs font-mono"> {primaryColor} </span>
			</label>
		</div>
		<div class="flex flex-row items-center py-2 px-4 h-12 justify-between">
			<span class="text-xs font-medium">Action color</span>
			<label
				class="rounded-lg overflow-hidden flex flex-row items-center shadow border"
				style="border-color: {actionColor};"
			>
				<input type="color" class="sr-only" bind:value={actionColor} on:input={sendMessage} />
				<div type="color" class="w-8 h-8" style="background-color: {actionColor};" />
				<span class="px-2 text-xs font-mono"> {actionColor} </span>
			</label>
		</div>
		<!-- <div>
			<span class="text-xs font-medium">Font</span>
			<select>
				<option>Test</option>
			</select>
		</div>
		 -->
	</div>
	<hr class="m-4" />
	<div>
		<h3 class="text-sm font-bold px-1 pb-4">Features</h3>
		<div class="grid grid-cols-2">
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">Login</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input
						bind:checked={loginEnabled}
						on:change={sendMessage}
						type="checkbox"
						value=""
						class="sr-only peer"
					/>
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">Coupons</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input type="checkbox" disabled value="" class="sr-only peer" />
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">Shipping</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						disabled
						bind:checked={shippingEnabled}
						on:change={sendMessage}
						value=""
						class="sr-only peer"
					/>
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">Cross-sell</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input type="checkbox" disabled value="" class="sr-only peer" />
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">ShopPay</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input
						bind:checked={shopPayEnabled}
						on:change={sendMessage}
						type="checkbox"
						value=""
						class="sr-only peer"
					/>
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">PayPal</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input
						bind:checked={payPalEnabled}
						on:change={sendMessage}
						type="checkbox"
						value=""
						class="sr-only peer"
					/>
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center p-1 px-4 justify-between w-full">
				<span class="text-xs font-medium">Consent</span>
				<label class="relative inline-flex items-center cursor-pointer">
					<input disabled type="checkbox" value="" class="sr-only peer" />
					<div
						class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
					></div>
				</label>
			</div>
		</div>
	</div>
</aside>
