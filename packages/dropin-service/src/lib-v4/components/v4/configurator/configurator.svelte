<script>
	// @ts-nocheck

	import ConfiguratorPanel from './configurator-panel.svelte';
	import ResponsiveWrapper from './responsive-wrapper.svelte';

	let checkoutWindow;
	export let content;
</script>

<svelte:head>
	<script>
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	</script>
</svelte:head>

<ConfiguratorPanel bind:checkoutWindow />
<ResponsiveWrapper bind:checkoutWindow src={content} title="Checkout" />
