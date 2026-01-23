<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Otp from './otp.svelte';

	const { Story } = defineMeta({
		title: 'UI/OTP',
		component: Otp,
		parameters: {
			layout: 'centered'
		},
		args: {
			length: 6,
			value: '',
			error: '',
			disabled: false,
			onComplete: fn(),
			onClearError: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80">
		<Otp {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="With Error"
	args={{
		error: 'Invalid verification code'
	}}
	{template}
/>

<Story
	name="Disabled"
	args={{
		disabled: true
	}}
	{template}
/>

<Story
	name="Four Digits"
	args={{
		length: 4
	}}
	{template}
/>

<Story
	name="Eight Digits"
	args={{
		length: 8
	}}
	{template}
/>
