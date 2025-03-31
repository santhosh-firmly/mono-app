<script>
	// @ts-nocheck

	import ConfiguratorContent from './configurator-content.svelte';
	import Configurator from './configurator.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Meta
	title="Checkout V4/View Models/Configurator"
	component={Configurator}
	tags={['autodocs']}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Template>
	<Configurator
		content="/iframe.html?globals=&args=&id=checkout-v4-view-models-configurator--content&viewMode=story"
	/>
</Template>

<Story name="Default" />

<Story name="Content">
	<ConfiguratorContent />
</Story>
