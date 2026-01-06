<script>
	let { children, data } = $props();
</script>

<header class="flex items-center justify-between border-b py-4">
	<div>
		<h1 class="text-lg font-semibold">VAR Service</h1>
	</div>
	<div class="flex items-center gap-4">
		{#if data?.authInfo?.name}
			<span class="text-muted-foreground text-sm">Welcome, {data.authInfo.name}</span>
		{/if}
		<a href="/auth/logout" class="text-sm text-blue-600 hover:underline">Logout</a>
	</div>
</header>

<div class="mx-auto max-w-4xl py-8">
	{@render children()}
</div>
