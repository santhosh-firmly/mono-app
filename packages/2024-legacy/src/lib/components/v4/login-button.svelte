<script>
	// @ts-nocheck
	import { isActionDark } from './theme-context.js';

	/**
	 * URL for the small logo displayed before the merchant name.
	 */
	export let smallLogo = '';

	/**
	 * Large logo URL.
	 */
	export let largeLogo = '';

	/**
	 * Display text
	 */
	export let displayText = 'Login with';

	/**
	 * Merchant Name
	 */
	export let merchantName = '';

	/**
	 * Disable the button
	 */
	export let disabled = false;
</script>

<button
	on:click
	class="flex flex-row gap-2 p-3 items-center w-full pr-5 justify-center text-fy-on-action bg-fy-action rounded shadow"
	{disabled}
>
	{#if smallLogo && !largeLogo}
		<img class="inline h-6" src={smallLogo} alt="" />
	{/if}

	{#if displayText}
		<span class="inline font-normal">
			{displayText}
			{#if !largeLogo}
				<span class="inline font-bold">
					{merchantName}
				</span>
			{/if}
		</span>
	{/if}

	{#if largeLogo}
		<img
			class="inline h-4 align-middle {$isActionDark ? 'grayscale invert' : ''}"
			src={largeLogo}
			alt="{merchantName} logo"
		/>
	{/if}
</button>
