<script context="module">
	import SignInForm from './sign-in-form.svelte';
	export const meta = {
		title: 'Authentication/Sign In Form',
		component: SignInForm
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default">
	<SignInForm />
</Story>
