<script>
	// @ts-nocheck
	import { sApiProgressInfo } from '$lib/browser/api-manager.js';
	import ApiProgressIcon from '$lib/components/common/svg/api-progress-icon.svelte';
</script>

{#if $sApiProgressInfo.header}
	<div class="flex flex-col h-3/4 justify-center">
		<div class="flex flex-col items-center gap-4 text-center">
			<ApiProgressIcon />
			<div class="text-xl my-2">{$sApiProgressInfo.header}</div>
			<div class="text-xs text-secondary">{$sApiProgressInfo.info}</div>
		</div>
	</div>
{/if}
