<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiFirmlyPowered from '$lib/components/ui/firmly-powered.svelte';

	const { Story } = defineMeta({
		title: 'UI/Firmly Powered',
		component: UiFirmlyPowered,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<!-- Default -->
<Story name="Default" />
