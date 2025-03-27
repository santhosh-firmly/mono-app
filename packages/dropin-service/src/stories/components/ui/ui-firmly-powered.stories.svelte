<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UiFirmlyPowered from '$lib/components/ui/ui-firmly-powered.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Firmly Powered',
		component: UiFirmlyPowered,
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template()}
	<UiFirmlyPowered />
{/snippet}

<Story name="Default" children={template} />
