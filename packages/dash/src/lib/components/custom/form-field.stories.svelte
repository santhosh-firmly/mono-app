<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormField from './form-field.svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	const { Story } = defineMeta({
		title: 'Forms/Form Field',
		component: FormField,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			id: { control: 'text' },
			label: { control: 'text' },
			helpText: { control: 'text' }
		}
	});
</script>

{#snippet inputContent()}
	<Input placeholder="Enter value..." />
{/snippet}

{#snippet selectContent()}
	<select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
		<option value="">Select option...</option>
		<option value="1">Option 1</option>
		<option value="2">Option 2</option>
	</select>
{/snippet}

{#snippet template(args)}
	<FormField {...args}>
		{@render inputContent()}
	</FormField>
{/snippet}

{#snippet selectTemplate(args)}
	<FormField {...args}>
		{@render selectContent()}
	</FormField>
{/snippet}

<Story
	name="Default"
	args={{
		id: 'email',
		label: 'Email Address',
		helpText: 'Enter your primary email address.'
	}}
	{template}
/>

<Story
	name="Without Help Text"
	args={{
		id: 'name',
		label: 'Full Name'
	}}
	{template}
/>

<Story
	name="With Select"
	args={{
		id: 'country',
		label: 'Country',
		helpText: 'Select your country of residence.'
	}}
	{selectTemplate}
/>

<Story
	name="Required Field"
	args={{
		id: 'password',
		label: 'Password *',
		helpText: 'Must be at least 8 characters.'
	}}
	{template}
/>
