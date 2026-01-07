<script>
	import Building2 from 'lucide-svelte/icons/building-2';

	let { domain, size = 'md', class: className = '' } = $props();
	let imageError = $state(false);

	let faviconUrl = $derived(
		`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain)}`
	);

	const sizeClasses = {
		sm: 'h-6 w-6',
		md: 'h-10 w-10',
		lg: 'h-12 w-12'
	};

	const iconSizeClasses = {
		sm: 'h-3 w-3',
		md: 'h-5 w-5',
		lg: 'h-6 w-6'
	};
</script>

{#if imageError}
	<div
		class={[
			'rounded-full bg-primary/10 flex items-center justify-center',
			sizeClasses[size],
			className
		]}
	>
		<Building2 class={['text-primary', iconSizeClasses[size]]} />
	</div>
{:else}
	<img
		src={faviconUrl}
		alt={domain}
		class={['rounded-full object-cover bg-muted', sizeClasses[size], className]}
		onerror={() => (imageError = true)}
	/>
{/if}
