<script>
	// @ts-nocheck
	import { sApiProgressInfo } from '$lib-v4/browser/api-manager.js';
	import ApiProgressIcon from '$lib-v4/components/common/svg/api-progress-icon.svelte';
</script>

{#if $sApiProgressInfo.header}
	<div class="flex h-3/4 flex-col justify-center">
		<div class="flex flex-col items-center gap-4 text-center">
			<ApiProgressIcon />
			<div class="my-2 text-xl">{$sApiProgressInfo.header}</div>
			<div class="text-secondary text-xs">{$sApiProgressInfo.info}</div>
		</div>
	</div>
{/if}
