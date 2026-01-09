<script>
	import Circle from 'lucide-svelte/icons/circle';
	import Loader from 'lucide-svelte/icons/loader';
	import CheckCircle from 'lucide-svelte/icons/check-circle';

	/**
	 * @typedef {'pending' | 'in-progress' | 'completed'} Status
	 * @typedef {'sm' | 'md'} Size
	 */

	let { status = 'pending', onChange = () => {}, size = 'md' } = $props();

	let iconClass = $derived(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5');
</script>

<div class="inline-flex items-center gap-1 rounded-md border p-1">
	<button
		type="button"
		class="rounded p-1.5 transition-colors {status === 'pending'
			? 'bg-muted'
			: 'hover:bg-muted/50'}"
		title="Pending"
		onclick={() => onChange('pending')}
	>
		<Circle
			class="{iconClass} {status === 'pending'
				? 'text-foreground'
				: 'text-muted-foreground/50'}"
		/>
	</button>
	<button
		type="button"
		class="rounded p-1.5 transition-colors {status === 'in-progress'
			? 'bg-muted'
			: 'hover:bg-muted/50'}"
		title="In Progress"
		onclick={() => onChange('in-progress')}
	>
		<Loader
			class="{iconClass} {status === 'in-progress'
				? 'text-primary'
				: 'text-muted-foreground/50'}"
		/>
	</button>
	<button
		type="button"
		class="rounded p-1.5 transition-colors {status === 'completed'
			? 'bg-muted'
			: 'hover:bg-muted/50'}"
		title="Completed"
		onclick={() => onChange('completed')}
	>
		<CheckCircle
			class="{iconClass} {status === 'completed'
				? 'text-green-600 dark:text-green-400'
				: 'text-muted-foreground/50'}"
		/>
	</button>
</div>
