<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Info from 'lucide-svelte/icons/info';

	/**
	 * @typedef {'success' | 'error' | 'warning' | 'info'} Variant
	 */

	let { variant = 'info', message = '', class: className = '' } = $props();

	const variantStyles = {
		success: {
			card: 'border-green-200 bg-green-50',
			icon: CheckCircle,
			iconClass: 'text-green-600',
			textClass: 'text-green-700'
		},
		error: {
			card: 'border-red-200 bg-red-50',
			icon: AlertCircle,
			iconClass: 'text-red-600',
			textClass: 'text-red-700'
		},
		warning: {
			card: 'border-yellow-200 bg-yellow-50',
			icon: AlertCircle,
			iconClass: 'text-yellow-600',
			textClass: 'text-yellow-700'
		},
		info: {
			card: 'border-blue-200 bg-blue-50',
			icon: Info,
			iconClass: 'text-blue-600',
			textClass: 'text-blue-700'
		}
	};

	let styles = $derived(variantStyles[variant] || variantStyles.info);
	let IconComponent = $derived(styles.icon);
</script>

<Card.Root class="{styles.card} {className}">
	<Card.Content class="py-4">
		<div class="flex items-center gap-3">
			<IconComponent class="h-5 w-5 flex-shrink-0 {styles.iconClass}" />
			<p class="text-sm {styles.textClass}">{message}</p>
		</div>
	</Card.Content>
</Card.Root>
