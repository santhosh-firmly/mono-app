<script>
	let { children, class: className = '' } = $props();
</script>

<div class="mx-auto w-full max-w-content {className}">
	{@render children()}
</div>
