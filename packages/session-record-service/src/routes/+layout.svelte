<script>
	import '../app.css';
	const { children } = $props();
</script>

<div class="mx-auto max-w-4xl">
	{@render children?.()}
</div>
