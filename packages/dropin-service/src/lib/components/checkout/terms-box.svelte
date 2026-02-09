<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import { slide } from 'svelte/transition';
	import UiAlert from '$lib/components/ui/alert.svelte';
	import * as m from '$lib/paraglide/messages';

	let { partnerName = '', merchantName, anchors = [] } = $props();

	let expanded = $state(false);

	function sanitizeUrl(url) {
		if (!url || typeof url !== 'string') return '';
		try {
			const parsed = new URL(url);
			return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
		} catch {
			return '';
		}
	}

	let safeAnchors = $derived(
		anchors.map((a) => ({ ...a, url: sanitizeUrl(a.url) })).filter((a) => a.url)
	);
</script>

<UiAlert raw={true}>
	<div class="relative text-sm">
		<span class={['inline-block leading-normal', safeAnchors.length > 0 && 'pr-6']}>
			By placing this order, you agree to the Terms of Service and Privacy Policy of
			{#if partnerName}
				<span class="font-bold">{partnerName}</span>
				and
			{/if}
			<span class="font-bold">{merchantName}</span>.
			{#if expanded && safeAnchors.length > 0}
				<div
					class="mt-2 flex flex-col items-center gap-1.5 border-t border-gray-200 pt-2"
					transition:slide={{ duration: 150, axis: 'y' }}
				>
					{#each safeAnchors as anchor}
						<a
							class="text-sm underline"
							target="_blank"
							rel="noopener noreferrer"
							href={anchor.url}
						>
							{anchor.label}
						</a>
					{/each}
				</div>
			{/if}
		</span>
		{#if safeAnchors.length > 0}
			<span class="absolute top-0 right-0 z-10 flex flex-row justify-end">
				<button
					type="button"
					aria-label={m.terms_toggle_details()}
					aria-expanded={expanded}
					onclick={() => (expanded = !expanded)}
					class="rounded p-1 transition-colors hover:bg-gray-200"
				>
					<Icon
						icon="mdi:chevron-down"
						class={[
							'size-4 transition-transform duration-200',
							expanded ? 'rotate-180' : ''
						]}
					/>
				</button>
			</span>
		{/if}
	</div>
</UiAlert>
