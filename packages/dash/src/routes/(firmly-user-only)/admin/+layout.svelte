<script>
	import '../../../app.css';
	import NavBar from '$lib/components/app/navbar.svelte';
	import ContentContainer from '$lib/components/ui/content-container.svelte';
	import { page } from '$app/stores';

	let { data, children } = $props();
</script>

<div class="flex min-h-screen w-full flex-col bg-background">
	<NavBar {data} currentPath={$page.url.pathname} />
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
		<ContentContainer>
			{@render children()}
		</ContentContainer>
	</div>
</div>
