<script>
	import * as Card from '$lib/components/ui/card/index.js';

	let { icon: Icon, label, value, variant = 'default', loading = false } = $props();

	const variantClasses = {
		default: 'bg-primary/10 text-primary',
		blue: 'bg-blue-500/10 text-blue-500',
		green: 'bg-green-500/10 text-green-500',
		yellow: 'bg-yellow-500/10 text-yellow-500',
		red: 'bg-red-500/10 text-red-500',
		purple: 'bg-purple-500/10 text-purple-500'
	};

	let iconClass = $derived(variantClasses[variant] || variantClasses.default);
</script>

<Card.Root>
	<Card.Content class="pt-6">
		<div class="flex items-center gap-3">
			<div class="p-2 rounded-lg {iconClass}">
				<Icon class="h-5 w-5" />
			</div>
			<div>
				<p class="text-sm text-muted-foreground">{label}</p>
				<p class="text-2xl font-bold">
					{#if loading}
						...
					{:else}
						{value}
					{/if}
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
