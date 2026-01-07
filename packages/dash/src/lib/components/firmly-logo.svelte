<script>
	/**
	 * @type {{
	 *   size?: 'sm' | 'md' | 'lg' | 'xl',
	 *   class?: string
	 * }}
	 */
	let { size = 'md', class: className = '' } = $props();

	const sizeClasses = {
		sm: 'text-lg',
		md: 'text-2xl',
		lg: 'text-3xl',
		xl: 'text-4xl'
	};
</script>

<span class="font-josefin select-none {sizeClasses[size]} {className}" aria-label="Firmly"
	>firmly<span class="text-primary">.</span></span
>
