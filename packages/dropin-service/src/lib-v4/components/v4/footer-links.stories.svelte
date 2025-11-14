<script>
	// @ts-nocheck
	import FooterLinks from './footer-links.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
</script>

<Meta title="Checkout V4/Checkout/FooterLinks" component={FooterLinks} tags={['autodocs']} />

<Template let:args>
	<FooterLinks {...args} />
</Template>

<Story name="Default" />

<Story name="Centered Banner Compact">
	<div class="bg-black py-2 text-center text-sm text-white">
		<FooterLinks />
	</div>
</Story>

<Story name="Centered Banner Compact White">
	<div class="bg-white py-2 text-center text-sm text-black">
		<FooterLinks />
	</div>
</Story>
