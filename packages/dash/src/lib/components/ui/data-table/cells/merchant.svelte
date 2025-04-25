<script>
	import Store from 'lucide-svelte/icons/store';

	export let logoUrl = '';
	export let logoSvg = '';
	export let name = '';
	export let domain = '';
</script>

<div class="flex flex-row items-center gap-2">
	<div
		class="flex aspect-square h-12 w-12 flex-row items-center justify-center overflow-hidden rounded-full border shadow"
	>
		{#if logoUrl}
			<img src={logoUrl} alt="Merchant logo" class="p-1" />
		{:else if logoSvg}
			<img src="data:image/svg+xml,{encodeURIComponent(logoSvg)}" alt="Merchant logo" class="p-1" />
		{:else}
			<Store strokeWidth="2" class="h-6 w-6 text-muted-foreground" />
		{/if}

		<!-- <Avatar.Root class="h-9 w-9">
		<Avatar.Image src="/images/placeholder-user.jpg" alt="@shadcn" />
		<Avatar.Fallback>SC</Avatar.Fallback>
	</Avatar.Root> -->
	</div>
	<div class="flex flex-col">
		<span class="font-semibold text-ellipsis overflow-hidden text-nowrap">{name || domain}</span>
		{#if name}
			<span class="text-muted-foreground text-ellipsis overflow-hidden text-nowrap">{domain}</span>
		{/if}
	</div>
</div>
