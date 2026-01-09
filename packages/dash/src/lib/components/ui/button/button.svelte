<script>
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { buttonVariants } from './index.js';
	import { cn } from '$lib/utils.js';
	let className = undefined;
	export let variant = 'default';
	export let size = 'default';
	export { className as class };
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
