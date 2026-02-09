<script>
	// @ts-nocheck

	import { slide } from 'svelte/transition';
	import FooterLinks from './footer-links.svelte';
	import PaymentButton from './payment-button.svelte';

	let {
		terms = null,
		buttonText = 'Place Order',
		onclick,
		total,
		disabled,
		inProgress,
		isOrderPlaced
	} = $props();

	let expanded = $state(false);
</script>

<div class="flex flex-col gap-4 pt-4 text-center">
	{#if terms}
		<div class="rounded-lg bg-[#F7F7F7] p-3">
			<button
				type="button"
				class="flex w-full items-start justify-between gap-2 text-left"
				on:click={() => (expanded = !expanded)}
				aria-expanded={expanded}
			>
				<span class="text-fy-on-surface-subtle text-xs leading-normal">
					By placing this order, you agree to the Terms of Service and Privacy Policy of
					<span class="font-semibold">{terms.partnerName}</span>
					and
					<span class="font-semibold">{terms.merchantName}</span>.
				</span>
				<svg
					class="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 {expanded
						? 'rotate-180'
						: ''}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
			{#if expanded && terms.anchors?.length > 0}
				<div
					transition:slide={{ duration: 150, axis: 'y' }}
					class="mt-2 flex flex-col gap-1.5 border-t border-gray-200 pt-2"
				>
					{#each terms.anchors as anchor}
						<a
							class="text-fy-on-surface-subtle text-xs underline"
							target="_blank"
							rel="noopener noreferrer"
							href={anchor.url}
						>
							{anchor.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	<PaymentButton {onclick} {total} {disabled} {inProgress} {isOrderPlaced} {buttonText} />
	<span
		class="text-fy-on-primary-subtle flex flex-row items-start justify-center gap-2 text-xs leading-normal"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="11"
			height="16"
			viewBox="0 0 11 16"
			fill="none"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M5.50087 0C4.6463 0 3.82674 0.396186 3.22247 1.1014C2.6182 1.80662 2.27872 2.76309 2.27872 3.76042V5.90923C1.7904 5.90923 1.32208 6.13562 0.976782 6.5386C0.631486 6.94158 0.4375 7.48814 0.4375 8.05804V12.8929C0.4375 13.4628 0.631486 14.0093 0.976782 14.4123C1.32208 14.8153 1.7904 15.0417 2.27872 15.0417H8.72301C9.21133 15.0417 9.67966 14.8153 10.025 14.4123C10.3703 14.0093 10.5642 13.4628 10.5642 12.8929V8.05804C10.5642 7.48814 10.3703 6.94158 10.025 6.5386C9.67966 6.13562 9.21133 5.90923 8.72301 5.90923V3.76042C8.72301 1.68323 7.28072 0 5.50087 0ZM7.8024 5.90923V3.76042C7.8024 3.04804 7.55992 2.36484 7.1283 1.86112C6.69668 1.35739 6.11127 1.0744 5.50087 1.0744C4.89046 1.0744 4.30506 1.35739 3.87344 1.86112C3.44182 2.36484 3.19934 3.04804 3.19934 3.76042V5.90923H7.8024Z"
				fill="#A3A3A3"
			/>
		</svg>
		Payments are secure and encrypted
	</span>
	<span class="text-fy-on-primary-subtle mt-6 text-xs @md:hidden">
		<FooterLinks />
	</span>
</div>
