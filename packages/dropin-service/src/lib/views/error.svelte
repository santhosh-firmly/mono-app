<script>
	import * as m from '$lib/paraglide/messages';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiFirmlyPowered from '$lib/components/ui/firmly-powered.svelte';
	import { getLuminance } from '$lib/utils/color-utils';

	/**
	 * @typedef {Object} ErrorViewProps
	 * @property {string} [title] - Error title
	 * @property {string} [message] - Error description message
	 * @property {string} [errorCode] - Error code for debugging
	 * @property {Object} [colors] - Theme colors (primary, action)
	 * @property {Function} [onClose] - Handler for go back button
	 * @property {Function} [onRetry] - Handler for retry button (optional)
	 */

	/** @type {ErrorViewProps} */
	let {
		title = m.error(),
		message = '',
		errorCode = '',
		colors = {},
		onClose = () => {},
		onRetry = null
	} = $props();

	let primaryColor = $derived(colors?.primary || '#ffffff');
	let actionColor = $derived(colors?.action || '#333333');
	let textColor = $derived(getLuminance(primaryColor) > 0.5 ? '#000000' : '#ffffff');
	let mutedColor = $derived(
		getLuminance(primaryColor) > 0.5
			? 'color-mix(in srgb, #000000 50%, transparent)'
			: 'color-mix(in srgb, #ffffff 70%, transparent)'
	);

	let containerRef = $state(null);

	$effect(() => {
		if (containerRef && colors) {
			containerRef.style.setProperty('--color-primary', primaryColor);
			containerRef.style.setProperty('--color-action', actionColor);
			containerRef.style.setProperty('--color-text', textColor);
			containerRef.style.setProperty('--color-muted', mutedColor);
			containerRef.style.setProperty(
				'--color-on-action',
				getLuminance(actionColor) > 0.5 ? '#000000' : '#ffffff'
			);
		}
	});
</script>

<div
	bind:this={containerRef}
	class="@container flex size-full flex-col bg-white"
	style="--color-primary: {primaryColor}; --color-action: {actionColor};"
>
	<main
		class="flex flex-1 flex-col px-4 py-6 @3xl:mx-auto @3xl:w-full @3xl:max-w-md @3xl:px-0 @3xl:py-12"
	>
		<div class="flex flex-1 flex-col items-center justify-center gap-6 @3xl:gap-8">
			<!-- Error Icon -->
			<div class="flex flex-col items-center gap-4 text-center @3xl:gap-6">
				<div
					class="flex size-14 items-center justify-center rounded-full bg-red-50 @3xl:size-16"
				>
					<Icon
						icon="mdi:alert-circle-outline"
						class="text-2xl text-red-500 @3xl:text-3xl"
					/>
				</div>

				<!-- Error Content -->
				<div class="flex flex-col gap-2">
					<h1 class="text-text text-xl font-semibold @3xl:text-2xl">{title}</h1>
					{#if message}
						<p class="text-muted max-w-sm text-sm/relaxed">{message}</p>
					{/if}
					{#if errorCode}
						<p class="text-muted mt-1 text-xs @3xl:mt-2">
							{m.error_code({ code: errorCode })}
						</p>
					{/if}
				</div>
			</div>

			<!-- Error Details Card -->
			<section class="frosted w-full max-w-sm overflow-hidden rounded-lg p-4 @3xl:p-6">
				<div class="flex flex-col items-center gap-3 text-center @3xl:gap-4">
					<span class="font-josefin text-lg font-semibold text-gray-900 @3xl:text-xl"
						>firmly</span
					>
					<p class="text-xs text-gray-500 @3xl:text-sm">
						{m.error_support_message()}
					</p>
				</div>
			</section>

			<!-- Action Buttons -->
			<div class="flex w-full max-w-sm flex-col gap-2 @3xl:gap-3">
				{#if onRetry}
					<button
						onclick={onRetry}
						class="bg-action text-on-action flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90"
					>
						<Icon icon="mdi:refresh" class="text-lg" />
						{m.try_again()}
					</button>
				{/if}
				<button
					onclick={onClose}
					class={[
						'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-opacity',
						onRetry
							? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
							: 'bg-action text-on-action hover:opacity-90'
					]}
				>
					<Icon icon="mdi:arrow-left" class="text-lg" />
					{m.go_back()}
				</button>
			</div>
		</div>

		<!-- Footer -->
		<footer class="flex justify-center pt-6">
			<UiFirmlyPowered />
		</footer>
	</main>
</div>
