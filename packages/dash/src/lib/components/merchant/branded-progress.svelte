<script>
	import { Progress } from '$lib/components/ui/progress/index.js';

	let { value = 0, color = 'purple', class: className = '' } = $props();

	const colorClasses = {
		purple: '[&>div]:bg-primary',
		green: '[&>div]:bg-green-600'
	};

	let colorClass = $derived(colorClasses[color] || colorClasses.purple);
</script>

<Progress {value} class={`h-2 ${colorClass} ${className}`} />
