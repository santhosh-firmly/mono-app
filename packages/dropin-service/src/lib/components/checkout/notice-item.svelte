<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import { fade, fly } from 'svelte/transition';

	/**
	 * @typedef {'info' | 'success' | 'warning' | 'error'} NoticeType
	 */

	/**
	 * @typedef {Object} NoticeItemProps
	 * @property {string} id - Unique identifier for the notice
	 * @property {NoticeType} type - Type of notice (affects styling)
	 * @property {string} message - Main message to display
	 * @property {string} [actionLabel] - Label for action button (e.g., "Undo")
	 * @property {Function} [onAction] - Called when action button is clicked
	 * @property {Function} [onDismiss] - Called when notice is dismissed
	 * @property {number} [duration] - Auto-dismiss duration in ms (0 = no auto-dismiss)
	 */

	/**
	 * @type {NoticeItemProps}
	 */
	let {
		id = '',
		type = 'info',
		message = '',
		actionLabel = '',
		onAction = () => {},
		onDismiss = () => {},
		duration = 5000
	} = $props();

	let timeoutId = $state(null);

	const typeStyles = {
		info: {
			bg: 'bg-blue-50',
			border: 'border-blue-200',
			text: 'text-blue-800',
			icon: 'mdi:information-outline'
		},
		success: {
			bg: 'bg-green-50',
			border: 'border-green-200',
			text: 'text-green-800',
			icon: 'mdi:check-circle-outline'
		},
		warning: {
			bg: 'bg-yellow-50',
			border: 'border-yellow-200',
			text: 'text-yellow-800',
			icon: 'mdi:alert-outline'
		},
		error: {
			bg: 'bg-red-50',
			border: 'border-red-200',
			text: 'text-red-800',
			icon: 'mdi:alert-circle-outline'
		}
	};

	let styles = $derived(typeStyles[type] || typeStyles.info);

	function handleAction() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		onAction(id);
	}

	function handleDismiss() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		onDismiss(id);
	}

	$effect(() => {
		if (duration > 0) {
			timeoutId = setTimeout(() => {
				onDismiss(id);
			}, duration);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});
</script>

<div
	class={['flex items-center gap-3 rounded-lg border p-3 shadow-sm', styles.bg, styles.border]}
	role="alert"
	in:fly={{ y: -20, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<Icon icon={styles.icon} class={['shrink-0 text-xl', styles.text]} />

	<span class={['flex-1 text-sm', styles.text]}>{message}</span>

	{#if actionLabel}
		<button
			type="button"
			onclick={handleAction}
			class={['shrink-0 text-sm font-semibold hover:underline', styles.text]}
		>
			{actionLabel}
		</button>
	{/if}

	<button
		type="button"
		onclick={handleDismiss}
		class={['shrink-0 rounded p-1 hover:bg-black/5', styles.text]}
		aria-label="Dismiss"
	>
		<Icon icon="mdi:close" class="text-lg" />
	</button>
</div>
