<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getInitials } from '$lib/utils.js';

	let { avatarDataUrl = null, name = null, email, size = 'sm' } = $props();

	const sizeClasses = {
		sm: 'h-8 w-8 text-xs',
		md: 'h-10 w-10 text-sm',
		lg: 'h-12 w-12 text-base'
	};

	let displayName = $derived(name || email);
	let initials = $derived(getInitials(name || email));
</script>

<Avatar.Root class={sizeClasses[size]}>
	{#if avatarDataUrl}
		<Avatar.Image src={avatarDataUrl} alt={displayName} />
	{/if}
	<Avatar.Fallback class="bg-primary/10 font-medium text-primary">
		{initials}
	</Avatar.Fallback>
</Avatar.Root>
