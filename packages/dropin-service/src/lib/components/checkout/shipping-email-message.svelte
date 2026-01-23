<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import { slide } from 'svelte/transition';
	import UiAlert from '$lib/components/ui/alert.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * C2P (Click to Pay) consent message component
	 * Shows Mastercard privacy notice with expandable details
	 */

	let expanded = $state(false);
</script>

<UiAlert raw={true}>
	<div class="relative text-sm">
		<span class="inline-block pr-6 leading-normal">
			{m.c2p_consent_start()}
			<a
				href="https://www.mastercard.com/global/click-to-pay/en-us/privacy-notice.html"
				target="_blank"
				rel="noopener noreferrer"
				class="font-bold underline"
			>
				{m.c2p_consent_link()}
			</a>
			{m.c2p_consent_end()}
			{#if expanded}
				<p
					class="mt-2"
					transition:slide={{
						duration: 150,
						axis: 'y'
					}}
				>
					{m.c2p_otp_message()}
				</p>
			{/if}
		</span>
		<span class="absolute top-0 right-0 z-10 flex flex-row justify-end">
			<button
				type="button"
				aria-label={m.c2p_show_more()}
				aria-expanded={expanded}
				onclick={() => (expanded = !expanded)}
				class="rounded p-1 transition-colors hover:bg-gray-200"
			>
				<Icon
					icon="mdi:chevron-down"
					class={[
						'size-4  transition-transform duration-200',
						expanded ? 'rotate-180' : ''
					]}
				/>
			</button>
		</span>
	</div>
</UiAlert>
