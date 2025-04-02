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
	class="fixed z-20 w-[300px] overflow-scroll bg-zinc-50 p-4 shadow-2xl dark:bg-zinc-800 dark:text-white {asSideBar
		? sideBarClasses
		: floatingClasses}"
>
	<div class="text-center text-sm text-gray-500 dark:text-gray-300">
		Customize the look & feel of Firmly Edge on your website.
	</div>
	<hr class="m-4" />
	<div>
		<h3 class="px-1 pb-2 text-sm font-bold">State</h3>
		<ul class="flex w-full flex-row flex-wrap justify-center gap-3 p-2">
			{#each states as state}
				<li>
					<input
						type="radio"
						id={state}
						name="state"
						value={state}
						class="peer hidden"
						on:change={onStateChange}
						checked={currentState === state}
						required
					/>
					<label
						for={state}
						class="inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-2 px-5 text-gray-500 peer-checked:border-red-600 peer-checked:text-red-600 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-red-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
					>
						<div class="block w-full text-center">
							<div class="w-full text-xs peer-checked:font-semibold">{state}</div>
						</div>
					</label>
				</li>
			{/each}
		</ul>
	</div>
	<hr class="m-4" />
	<div>
		<h3 class="px-1 pb-4 text-sm font-bold">Appearance</h3>
		<div class="flex h-12 flex-row items-center justify-between px-4 py-2">
			<span class="text-xs font-medium">Name</span>
			{#if editingName}
				<input
					class="p-1 text-xs text-black"
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
		<div class="flex h-12 flex-row items-center gap-2 px-4 py-2">
			<span class="text-xs font-medium">Icon </span>
			<label class="relative inline-flex cursor-pointer items-center">
				<input
					bind:checked={iconEnabled}
					on:change={sendMessage}
					type="checkbox"
					value=""
					class="peer sr-only"
				/>
				<div
					class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
				></div>
			</label>
			<div class="grow" />
			<img class="h-6 rounded-full" src={icon} alt="Icon" />
		</div>
		<div class="flex h-12 flex-row items-center gap-2 px-4 py-2">
			<span class="text-xs font-medium">Logo</span>
			<label class="relative inline-flex cursor-pointer items-center">
				<input
					bind:checked={largeLogoEnabled}
					on:change={sendMessage}
					type="checkbox"
					value=""
					class="peer sr-only"
				/>
				<div
					class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
				></div>
			</label>
			<div class="grow" />
			<img class="h-4 dark:grayscale dark:invert" src={largeLogo} alt="Logo" />
		</div>
		<div class="flex h-12 flex-row items-center justify-between px-4 py-2">
			<span class="text-xs font-medium">Brand color</span>
			<label
				class="flex flex-row items-center overflow-hidden rounded-lg border shadow"
				style="border-color: {primaryColor};"
			>
				<input type="color" class="sr-only" bind:value={primaryColor} on:input={sendMessage} />
				<div type="color" class="h-8 w-8" style="background-color: {primaryColor};" />
				<span class="px-2 font-mono text-xs"> {primaryColor} </span>
			</label>
		</div>
		<div class="flex h-12 flex-row items-center justify-between px-4 py-2">
			<span class="text-xs font-medium">Action color</span>
			<label
				class="flex flex-row items-center overflow-hidden rounded-lg border shadow"
				style="border-color: {actionColor};"
			>
				<input type="color" class="sr-only" bind:value={actionColor} on:input={sendMessage} />
				<div type="color" class="h-8 w-8" style="background-color: {actionColor};" />
				<span class="px-2 font-mono text-xs"> {actionColor} </span>
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
		<h3 class="px-1 pb-4 text-sm font-bold">Features</h3>
		<div class="grid grid-cols-2">
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">Login</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input
						bind:checked={loginEnabled}
						on:change={sendMessage}
						type="checkbox"
						value=""
						class="peer sr-only"
					/>
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">Coupons</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" disabled value="" class="peer sr-only" />
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">Shipping</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input
						type="checkbox"
						disabled
						bind:checked={shippingEnabled}
						on:change={sendMessage}
						value=""
						class="peer sr-only"
					/>
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">Cross-sell</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" disabled value="" class="peer sr-only" />
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">ShopPay</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input
						bind:checked={shopPayEnabled}
						on:change={sendMessage}
						type="checkbox"
						value=""
						class="peer sr-only"
					/>
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">PayPal</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input
						bind:checked={payPalEnabled}
						on:change={sendMessage}
						type="checkbox"
						value=""
						class="peer sr-only"
					/>
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-1 px-4">
				<span class="text-xs font-medium">Consent</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input disabled type="checkbox" value="" class="peer sr-only" />
					<div
						class="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-800"
					></div>
				</label>
			</div>
		</div>
	</div>
</aside>
