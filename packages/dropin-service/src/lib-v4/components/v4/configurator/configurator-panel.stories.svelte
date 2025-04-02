<script>
	// @ts-nocheck

	import ConfiguratorPanel from './configurator-panel.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Meta
	title="Checkout V4/Configurator/Configurator Panel"
	component={ConfiguratorPanel}
	tags={['autodocs']}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Template>
	<ConfiguratorPanel />
</Template>

<Story name="Default" />
