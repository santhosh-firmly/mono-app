<script>
	import { Avatar as AvatarPrimitive } from 'bits-ui';

	let { name, class: className } = $props();

	// Get first two initials
	let initials = $derived(
		name
			? name
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.slice(0, 2)
			: ''
	);
</script>

<AvatarPrimitive.Root
	class={['relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full', className]}
>
	<AvatarPrimitive.Fallback
		class="bg-accent-foreground border-border flex h-full w-full items-center justify-center rounded-full border text-xs font-medium"
	>
		{initials}
	</AvatarPrimitive.Fallback>
</AvatarPrimitive.Root>
