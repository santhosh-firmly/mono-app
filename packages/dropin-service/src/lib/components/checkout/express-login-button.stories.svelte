<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ExpressLoginButton from './express-login-button.svelte';

	const { Story } = defineMeta({
		title: 'Work in Progress/Merchant Login/Express Login Button',
		component: ExpressLoginButton,
		parameters: {
			layout: 'centered'
		},
		args: {
			disabled: false,
			loading: false,
			email: '',
			onclick: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80 p-4">
		<ExpressLoginButton {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="With Email (Returning User)" args={{ email: 'john@example.com' }} {template} />

<Story name="Loading" args={{ loading: true }} {template} />

<Story name="Disabled" args={{ disabled: true }} {template} />

<Story name="Disabled With Email" args={{ disabled: true, email: 'john@example.com' }} {template} />
