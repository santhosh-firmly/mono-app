<script>
	import Shield from 'lucide-svelte/icons/shield';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<div class="flex items-center justify-between bg-primary px-4 py-2 text-primary-foreground">
	<div class="flex items-center gap-2">
		<Shield class="h-4 w-4" />
		<span class="text-sm font-medium">Viewing as Firmly Admin</span>
	</div>
	<Button
		variant="ghost"
		size="sm"
		href="/admin/dashboards"
		class="text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
	>
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back to Admin
	</Button>
</div>
