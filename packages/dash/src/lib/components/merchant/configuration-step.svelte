<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';

	/**
	 * @typedef {Object} Step
	 * @property {string} title
	 * @property {string} description
	 * @property {string} [code]
	 * @property {string} [copyId]
	 */

	let {
		/** @type {Step} */
		step,
		index = 0,
		copiedSection = '',
		onCopy = () => {}
	} = $props();
</script>

<div class="space-y-3 rounded-lg border border-border p-5">
	<h4 class="flex items-center gap-3">
		<span
			class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
		>
			{index + 1}
		</span>
		<span class="font-medium text-foreground">{step.title}</span>
	</h4>
	<p class="ml-10 text-sm text-muted-foreground">
		{step.description}
	</p>
	{#if step.code}
		<div class="relative ml-10">
			<div
				class="overflow-x-auto rounded-lg bg-gray-900 p-4 pr-12 font-mono text-sm text-gray-100"
			>
				<pre class="whitespace-pre-wrap">{step.code}</pre>
			</div>
			<Button
				size="sm"
				variant="ghost"
				class="absolute right-2 top-2 text-gray-400 hover:text-white"
				onclick={() => onCopy(step.code, step.copyId)}
			>
				{#if copiedSection === step.copyId}
					<Check class="h-4 w-4" />
				{:else}
					<Copy class="h-4 w-4" />
				{/if}
			</Button>
		</div>
	{/if}
</div>
