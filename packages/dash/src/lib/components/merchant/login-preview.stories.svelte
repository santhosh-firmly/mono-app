<script context="module">
	import LoginPreview from './login-preview.svelte';
	export const meta = {
		title: 'Merchant/Branding/Login Preview',
		component: LoginPreview,
		parameters: {
			layout: 'fullscreen'
		}
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Interactive Preview">
	<LoginPreview />
</Story>
