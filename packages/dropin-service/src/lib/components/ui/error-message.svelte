<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} UiErrorMessageProps
	 * @property {string} message - Error message to display
	 * @property {Function} onDismiss - Optional callback when dismissing error
	 * @property {string} type - Error type (error, warning, info)
	 */

	/** @type {UiErrorMessageProps} */
	let { message = '', onDismiss = null, type = 'error' } = $props();

	let iconMap = {
		error: {
			icon: 'mdi:alert-circle',
			color: 'text-red-600',
			bg: 'bg-red-50',
			border: 'border-red-200'
		},
		warning: {
			icon: 'mdi:alert',
			color: 'text-yellow-600',
			bg: 'bg-yellow-50',
			border: 'border-yellow-200'
		},
		info: {
			icon: 'mdi:information',
			color: 'text-blue-600',
			bg: 'bg-blue-50',
			border: 'border-blue-200'
		}
	};

	let config = $derived(iconMap[type] || iconMap.error);
</script>

{#if message}
	<div class={['rounded border p-4', config.border, config.bg]}>
		<div class="flex items-start gap-3">
			<Icon icon={config.icon} class={['shrink-0 text-xl', config.color]} />
			<div class="flex-1">
				<p class={['text-sm', config.color]}>{message}</p>
			</div>
			{#if onDismiss}
				<button
					onclick={onDismiss}
					class={['hover:opacity-70', config.color]}
					aria-label="Dismiss"
				>
					<Icon icon="mdi:close" class="text-lg" />
				</button>
			{/if}
		</div>
	</div>
{/if}
