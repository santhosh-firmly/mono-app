<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import SessionList from '$lib/components/session-list.svelte';

	const generateMockSessions = (count) =>
		Array.from({ length: count }, (_, i) => ({
			sessionId: `session-${i + 1}-${Math.random().toString(36).substr(2, 9)}`,
			url: `https://example.com/${['checkout', 'product', 'cart', 'profile', 'settings', 'dashboard'][i % 6]}`,
			eventCount: Math.floor(Math.random() * 200) + 50,
			duration: Math.floor(Math.random() * 300000) + 30000,
			timestamp: Date.now() - i * 3600000
		}));
</script>

<Meta
	title="Pages/Session Recordings"
	parameters={{
		layout: 'fullscreen',
		backgrounds: {
			default: 'light',
			values: [{ name: 'light', value: '#fafafa' }]
		}
	}}
/>

<Story name="Default">
	<div class="py-16">
		<header class="mb-12 text-center">
			<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions</p>
		</header>

		<SessionList
			sessions={generateMockSessions(25)}
			emptyAction={{
				label: 'Try the example page',
				onClick: () => alert('Navigate to /example')
			}}
		/>
	</div>
</Story>

<Story name="Loading">
	<div class="py-16">
		<header class="mb-12 text-center">
			<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions</p>
		</header>

		<SessionList sessions={[]} loading={true} />
	</div>
</Story>

<Story name="Error">
	<div class="py-16">
		<header class="mb-12 text-center">
			<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions</p>
		</header>

		<SessionList sessions={[]} error="Failed to load sessions. Please try again later." />
	</div>
</Story>

<Story name="Empty">
	<div class="py-16">
		<header class="mb-12 text-center">
			<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions</p>
		</header>

		<SessionList
			sessions={[]}
			emptyAction={{
				label: 'Try the example page',
				onClick: () => alert('Navigate to /example')
			}}
		/>
	</div>
</Story>

<Story name="Few Items">
	<div class="py-16">
		<header class="mb-12 text-center">
			<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions</p>
		</header>

		<SessionList sessions={generateMockSessions(5)} />
	</div>
</Story>
