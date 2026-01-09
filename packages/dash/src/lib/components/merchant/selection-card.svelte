<script>
	import Check from 'lucide-svelte/icons/check';

	/**
	 * @typedef {Object} Feature
	 * @property {string} text
	 */

	/**
	 * @typedef {Object} Recommendation
	 * @property {string} text
	 * @property {'primary' | 'secondary'} [variant]
	 */

	let {
		selected = false,
		onclick = () => {},
		icon: Icon = null,
		iconClass = 'text-primary',
		title = '',
		description = '',
		/** @type {Feature[]} */
		features = [],
		/** @type {Recommendation} */
		recommendation = null
	} = $props();

	let recommendationClasses = $derived(
		recommendation?.variant === 'secondary'
			? 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400'
			: 'bg-primary/10 border-primary/20 text-primary'
	);
</script>

<button
	type="button"
	class={[
		'w-full border-2 rounded-lg p-6 text-left transition-all',
		selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
	]}
	{onclick}
>
	<div class="flex items-start gap-4">
		<div
			class={[
				'flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5',
				selected ? 'border-primary bg-primary' : 'border-muted-foreground/50'
			]}
		>
			{#if selected}
				<Check class="h-3 w-3 text-white" />
			{/if}
		</div>
		<div class="flex-1">
			<div class="mb-2 flex items-center gap-3">
				{#if Icon}
					<Icon class="h-5 w-5 {iconClass}" />
				{/if}
				<span class="text-lg font-medium text-foreground">{title}</span>
			</div>
			{#if description}
				<p class="mb-3 text-sm text-muted-foreground">
					{description}
				</p>
			{/if}
			{#if features.length > 0}
				<div class="space-y-1.5">
					{#each features as feature (feature.text)}
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<span class="text-green-600 dark:text-green-400">✓</span>
							<span>{feature.text}</span>
						</div>
					{/each}
				</div>
			{/if}
			{#if recommendation}
				<div class="mt-4 rounded border p-3 {recommendationClasses}">
					<p class="text-sm">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- recommendation.text is trusted internal content -->
						{@html recommendation.text}
					</p>
				</div>
			{/if}
		</div>
	</div>
</button>
