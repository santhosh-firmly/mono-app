<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SignInPage from './sign-in-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Auth/Sign In',
		component: SignInPage,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<SignInPage {...args} />
{/snippet}

<Story name="Default" args={{}} {template} />
