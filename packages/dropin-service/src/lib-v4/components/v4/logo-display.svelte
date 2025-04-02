<script>
	//@ts-nocheck

	export let merchantLogo;
	export let merchantName;
</script>

<div>
	{#if merchantLogo}
		<img class="h-4" src={merchantLogo} alt="Merchant logo" />
	{:else}
		{merchantName}
	{/if}
</div>
