<script>
	// @ts-nocheck
	import TermsLinks from './terms-links.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
</script>

<Meta title="Checkout V4/Checkout/TermsLinks" component={TermsLinks} tags={['autodocs']} />

<Template let:args>
	<TermsLinks {...args} />
</Template>

<Story name="Default" />

<Story name="Centered Banner Compact">
	<div class="bg-black py-2 text-center text-sm text-white">
		<TermsLinks />
	</div>
</Story>

<Story name="Centered Banner Compact White">
	<div class="bg-white py-2 text-center text-sm text-black">
		<TermsLinks />
	</div>
</Story>
