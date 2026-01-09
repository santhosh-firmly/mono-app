<script>
	import '../app.css';
	const { children } = $props();
</script>

<div class="mx-auto max-w-5xl">
	{@render children()}
</div>
