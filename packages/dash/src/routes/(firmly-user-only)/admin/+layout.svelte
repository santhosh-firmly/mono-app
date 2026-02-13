<script>
	import '../../../app.css';
	import AdminHeader from '$lib/components/admin/admin-header.svelte';
	import AdminNavbar from '$lib/components/admin/admin-navbar.svelte';
	import ContentContainer from '$lib/components/ui/content-container.svelte';
	import { page } from '$app/stores';

	let { data, children } = $props();

	let currentPath = $derived($page.url.pathname);
</script>

<div class="flex min-h-screen flex-col bg-background">
	<AdminHeader
		user={data.authInfo}
		merchants={data.merchants}
		{currentPath}
		env={data.firmlyEnv}
	/>
	<div class="flex flex-1">
		<AdminNavbar {currentPath} />
		<main class="flex-1 overflow-auto p-4 lg:p-6">
			<ContentContainer>
				{@render children()}
			</ContentContainer>
		</main>
	</div>
</div>
