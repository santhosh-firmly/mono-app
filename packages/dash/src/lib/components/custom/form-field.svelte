<script>
	import { Label } from '$lib/components/ui/label/index.js';

	let {
		id = '',
		label = '',
		helpText = '',
		labelWidth = 'md:col-span-2',
		contentWidth = 'md:col-span-3',
		children
	} = $props();
</script>

<div class="flex flex-col">
	<div class={labelWidth}>
		{#if label}
			<Label for={id} class="text-sm font-semibold">{label}</Label>
		{/if}
	</div>

	<div class={[contentWidth, 'my-1']}>
		{@render children()}
	</div>
	{#if helpText}
		<p class="text-xs text-muted-foreground">{helpText}</p>
	{/if}
</div>
