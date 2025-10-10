<script>
	// @ts-nocheck
	import SimpleError from './simple-error.svelte';
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import './theme.css';
	import { isPrimaryDark } from './theme-context';

	function setDarkTheme() {
		isPrimaryDark.set(true);
	}

	function setLightTheme() {
		isPrimaryDark.set(false);
	}
</script>

<Meta
	title="Checkout V4/Common/Simple Error"
	component={SimpleError}
	tags={['autodocs']}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Story
	name="Default Error"
	args={{
		errorMessage: 'We encountered an issue loading your cart. Please try again.'
	}}
>
	<div class="theme-provider" use:setLightTheme>
		<SimpleError
			errorMessage="We encountered an issue loading your cart. Please try again."
			onBack={() => console.log('Back clicked')}
		/>
	</div>
</Story>
