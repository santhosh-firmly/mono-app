<script>
	import Store from 'lucide-svelte/icons/store';
	import * as Card from '$lib/components/ui/card/index.js';
	import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';

	let {
		domain = '',
		displayName = '',
		showFavicon = true,
		title = 'Store Information'
	} = $props();

	let faviconError = $state(false);

	function handleFaviconError() {
		faviconError = true;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2 text-base">
			<Store class="h-4 w-4" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center gap-3">
			{#if showFavicon && !faviconError && domain}
				<img
					src={`https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`}
					alt={displayName || domain}
					class="h-12 w-12 rounded-md border object-cover"
					onerror={handleFaviconError}
				/>
			{:else}
				<div class="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
					<Store class="h-6 w-6 text-muted-foreground" />
				</div>
			{/if}
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">
					{displayName || 'Store'}
				</p>
				{#if domain}
					<div class="flex items-center gap-2">
						<p class="truncate text-sm text-muted-foreground">
							{domain}
						</p>
						<CopyToClipboard value={domain} />
					</div>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
