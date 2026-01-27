<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import * as m from '$lib/paraglide/messages';
	import { toCurrency } from '$lib/utils/currency.js';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import orderPlacedAnimation from '$lib/assets/order-placed-animation.json';

	/**
	 * @typedef {Object} PurchaseButtonProps
	 * @property {number} totalPrice - The total price to display
	 * @property {boolean} [disabled=false] - Whether the button is disabled
	 * @property {boolean} [loading=false] - Whether the order is being processed
	 * @property {boolean} [success=false] - Whether the order was placed successfully
	 * @property {function} [onSubmit] - The function to call when clicked
	 * @property {string} [buttonText] - Custom button text (defaults to "Place Order")
	 * @property {boolean} [hideSecureMessage=false] - Whether to hide the secure payments message
	 * @property {string} [error=''] - Error message to display above the button
	 */

	/**
	 * @type {PurchaseButtonProps}
	 */
	let {
		totalPrice,
		disabled = false,
		loading = false,
		success = false,
		onSubmit,
		onAnimationComplete,
		buttonText,
		hideSecureMessage = false,
		error = '',
		class: className = ''
	} = $props();

	const ANIMATION_DURATION_MS = 1500;

	let displayText = $derived(buttonText || m.place_order());

	$effect(() => {
		if (success && onAnimationComplete) {
			const timer = setTimeout(() => {
				onAnimationComplete();
			}, ANIMATION_DURATION_MS);

			return () => clearTimeout(timer);
		}
	});
</script>

<div class={['flex flex-col items-center gap-3', className]}>
	{#if error}
		<p class="text-danger text-xs">{error}</p>
	{/if}
	<div class="flex w-full items-center justify-center">
		{#if success}
			<LottiePlayer
				width={48}
				height={48}
				src={orderPlacedAnimation}
				autoplay={true}
				loop={false}
				renderer="svg"
				background="transparent"
			/>
		{:else}
			<button
				disabled={disabled || loading}
				type="submit"
				class={[
					'relative flex cursor-pointer flex-row items-center justify-center rounded-lg py-3.5 text-sm font-medium transition-colors duration-200',
					{ 'w-14 rounded-full': loading, 'w-full': !loading },
					disabled
						? 'cursor-not-allowed bg-black/40 text-white'
						: 'bg-action text-on-action hover:bg-action/90'
				]}
				onclick={(event) => {
					event.preventDefault();
					onSubmit?.(event);
				}}
			>
				{#if loading}
					<svg
						aria-hidden="true"
						class="size-5 animate-spin fill-white text-white/30"
						viewBox="0 0 100 101"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
				{:else}
					<span>{displayText}</span>
					{#if totalPrice !== undefined}
						<span class="ml-1 opacity-70">· {toCurrency(totalPrice)}</span>
					{/if}
				{/if}
			</button>
		{/if}
	</div>

	{#if !success && !hideSecureMessage}
		<span class="flex items-center gap-1.5 text-xs text-gray-400">
			<Icon icon="mdi:lock" class="text-xs" />
			<p>{m.payment_are_encrypted()}</p>
		</span>
	{/if}
</div>
