<script>
	let { userName = '', subtitle = "Here's what's happening with your store today." } = $props();

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	}

	let greeting = $derived(getGreeting());
	let firstName = $derived(userName?.split(' ')[0] || 'there');
</script>

<div>
	<h1 class="text-2xl font-semibold text-foreground">
		{greeting}, {firstName}
	</h1>
	<p class="text-sm text-muted-foreground mt-1">{subtitle}</p>
</div>
