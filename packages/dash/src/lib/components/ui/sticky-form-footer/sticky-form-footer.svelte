<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Save from 'lucide-svelte/icons/save';

	let {
		onSave = () => {},
		disabled = false,
		loading = false,
		label = 'Save Changes',
		loadingLabel = 'Saving...',
		class: className = ''
	} = $props();
</script>

<div
	class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 p-4 backdrop-blur-sm md:relative md:mt-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none {className}"
>
	<div class="mx-auto flex max-w-4xl justify-end md:max-w-none">
		<Button
			onclick={onSave}
			disabled={disabled || loading}
			class="w-full bg-purple-600 hover:bg-purple-700 md:w-auto"
			size="lg"
		>
			{#if loading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{loadingLabel}
			{:else}
				<Save class="mr-2 h-5 w-5" />
				{label}
			{/if}
		</Button>
	</div>
</div>
