<script context="module">
	import SignInForm from './sign-in-form.svelte';
	export const meta = {
		title: 'Components/Authentication/Sign In',
		component: SignInForm
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default">
	<SignInForm />
</Story>
