<script>
	import { beforeNavigate, goto } from '$app/navigation';
	import { adminMode } from '$lib/stores/admin-mode.svelte.js';

	let { children } = $props();

	// Propagate admin_mode URL param on client-side navigations
	// This ensures the server knows about admin mode for each request
	beforeNavigate((navigation) => {
		if (adminMode.isAdminMode() && navigation.to?.url) {
			// Check if admin_mode param is missing
			if (!navigation.to.url.searchParams.has('admin_mode')) {
				// Cancel the current navigation
				navigation.cancel();

				// Build the correct URL with admin_mode param
				const targetUrl = new URL(navigation.to.url);
				targetUrl.searchParams.set('admin_mode', 'true');

				// Navigate to the correct URL
				goto(targetUrl.pathname + targetUrl.search, { replaceState: false });
			}
		}
	});
</script>

{@render children()}
