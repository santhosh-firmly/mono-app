<script>
	/**
	 * @type {{
	 *   size?: 'sm' | 'md' | 'lg' | 'xl',
	 *   class?: string,
	 *   env?: string | null
	 * }}
	 */
	let { size = 'md', class: className = '', env = null } = $props();

	const sizeClasses = {
		sm: 'text-lg',
		md: 'text-2xl',
		lg: 'text-3xl',
		xl: 'text-4xl'
	};
</script>

<span class="relative inline-flex items-center">
	<span class="font-josefin select-none {sizeClasses[size]} {className}" aria-label="Firmly"
		>firmly<span class="text-primary">.</span></span
	>
	{#if env && env !== 'prod'}
		<span
			class="absolute -top-2 -right-6 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-primary-foreground"
		>
			{env}
		</span>
	{/if}
</span>
