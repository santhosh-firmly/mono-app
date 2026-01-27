<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import MerchantLoginEmail from './merchant-login-email.svelte';

	const { Story } = defineMeta({
		title: 'Work in Progress/Merchant Login/Email',
		component: MerchantLoginEmail,
		parameters: {
			layout: 'centered'
		},
		args: {
			email: '',
			error: '',
			loading: false,
			onEmailChange: fn(),
			onSubmit: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80 rounded-lg border border-gray-200 bg-white p-4 shadow">
		<MerchantLoginEmail {...args} />
	</div>
{/snippet}

<Story name="Empty" {template} />

<Story name="With Email" args={{ email: 'john@example.com' }} {template} />

<Story
	name="With Error"
	args={{ email: 'invalid-email', error: 'Please enter a valid email address' }}
	{template}
/>

<Story name="Loading" args={{ email: 'john@example.com', loading: true }} {template} />
