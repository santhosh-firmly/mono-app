<script>
	// @ts-nocheck
	const sizeClasses = {
		xs: 'px-3 py-2 text-xs',
		sm: 'px-4 py-2 text-sm',
		md: 'px-5 py-2.5 text-sm',
		lg: 'px-5 py-3 text-base',
		xl: 'px-6 py-3.5 text-base'
	};
	export let size = 'md';

	const colorClasses = {
		gray: 'text-gray-600 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 dark:text-gray-900',
		blue: 'text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-200 dark:bg-blue-400 dark:hover:bg-blue-500 dark:focus:ring-blue-600'
	};
	export let color = 'blue';

	export let pill = false;
</script>

<button
	{...$$restProps}
	class="inline-flex items-center justify-center text-center font-medium focus:ring-4 focus:outline-none {sizeClasses[
		size
	]} {colorClasses[color]} {pill ? 'rounded-full' : 'rounded-lg'} {$$props.class}"
	on:click
	on:change
	on:keydown
	on:keyup
	on:mouseenter
	on:mouseleave><slot /></button
>
