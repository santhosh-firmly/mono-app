<script context="module">
	import SignInPage from './sign-in-page.svelte';
	export const meta = {
		title: 'Components/Authentication/Sign In Pagea',
		tags: ['autodocs'],
		component: SignInPage
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default">
	<SignInPage/>
</Story>
