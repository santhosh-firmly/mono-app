<script>
	/**
	 * Skeleton loading placeholder component
	 *
	 * @typedef {Object} SkeletonProps
	 * @property {'text' | 'circle' | 'rect' | 'button' | 'input'} variant - Shape variant
	 * @property {string} [width] - Custom width (e.g., '100px', '50%')
	 * @property {string} [height] - Custom height (e.g., '20px')
	 * @property {string} [class] - Additional CSS classes
	 * @property {boolean} [animate] - Whether to show pulse animation
	 */

	/**
	 * @type {SkeletonProps}
	 */
	let {
		variant = 'text',
		width = '',
		height = '',
		class: className = '',
		animate = true
	} = $props();

	const variantStyles = {
		text: 'h-4 rounded',
		circle: 'rounded-full aspect-square',
		rect: 'rounded-lg',
		button: 'h-10 rounded-lg',
		input: 'h-10 rounded-lg'
	};

	let baseStyle = $derived(variantStyles[variant] || variantStyles.text);
</script>

<div
	class={['bg-gray-200', baseStyle, animate && 'animate-pulse', className]}
	style:width={width || undefined}
	style:height={height || undefined}
	role="status"
	aria-label="Loading..."
>
	<span class="sr-only">Loading...</span>
</div>
