<script>
	import NoticeItem from './notice-item.svelte';

	/**
	 * @typedef {Object} Notice
	 * @property {string} id - Unique identifier
	 * @property {'info' | 'success' | 'warning' | 'error'} type - Notice type
	 * @property {string} message - Message to display
	 * @property {string} [actionLabel] - Action button label
	 * @property {Function} [onAction] - Action callback
	 * @property {number} [duration] - Auto-dismiss duration
	 */

	/**
	 * @typedef {Object} NoticeContainerProps
	 * @property {Notice[]} notices - Array of notices to display
	 * @property {Function} onDismiss - Called when a notice is dismissed
	 * @property {'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'} position - Position of the container
	 * @property {boolean} relative - Use absolute positioning instead of fixed (for rendering inside a container)
	 */

	/**
	 * @type {NoticeContainerProps}
	 */
	let { notices = [], onDismiss = () => {}, position = 'top-right', relative = false } = $props();

	const positionClasses = {
		'top-right': 'top-4 right-4',
		'top-left': 'top-4 left-4',
		'bottom-right': 'bottom-4 right-4',
		'bottom-left': 'bottom-4 left-4',
		'top-center': 'top-4 left-1/2 -translate-x-1/2',
		'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
	};

	let positionClass = $derived(positionClasses[position] || positionClasses['top-right']);
</script>

{#if notices.length > 0}
	<div
		class={[relative ? 'absolute' : 'fixed', 'z-1000 flex w-80 flex-col gap-2', positionClass]}
		role="region"
		aria-live="polite"
	>
		{#each notices as notice (notice.id)}
			<NoticeItem
				id={notice.id}
				type={notice.type}
				message={notice.message}
				actionLabel={notice.actionLabel}
				onAction={notice.onAction}
				{onDismiss}
				duration={notice.duration}
			/>
		{/each}
	</div>
{/if}
