<script>
	import Sidebar from '$lib/components/configurator/sidebar.svelte';
	import ResponsiveWrapper from '$lib/components/configurator/responsive-wrapper.svelte';

	let {
		configurator,
		flowPlayer = null,
		onReload,
		browserContentRef = $bindable(null),
		browserUrl = 'checkout.firmly.ai',
		children
	} = $props();

	let sidebarDisabled = $derived(flowPlayer?.isPlaying ?? false);
</script>

<div class="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
	<Sidebar {configurator} disabled={sidebarDisabled} />

	<div class="flex-1 overflow-hidden">
		<ResponsiveWrapper
			bind:width={configurator.viewportWidth}
			{flowPlayer}
			{onReload}
			{browserUrl}
			bind:browserContentRef
		>
			<div class="size-full overflow-auto">
				{@render children()}
			</div>
		</ResponsiveWrapper>
	</div>
</div>
