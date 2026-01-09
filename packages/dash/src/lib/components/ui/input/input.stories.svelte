<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Input } from '$lib/components/ui/input/index.js';

	const { Story } = defineMeta({
		title: 'Forms/Input',
		component: Input,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			type: {
				control: 'select',
				options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url']
			},
			placeholder: { control: 'text' },
			disabled: { control: 'boolean' },
			readonly: { control: 'boolean' }
		}
	});
</script>

<script>
	let defaultValue = $state('');
</script>

{#snippet template(args)}
	<Input {...args} class="w-64" />
{/snippet}

<Story name="Default" args={{ placeholder: 'Enter text...' }} {template} />
<Story name="With Value">
	{#snippet template()}
		<Input bind:value={defaultValue} placeholder="Type something..." class="w-64" />
	{/snippet}
</Story>
<Story name="Email" args={{ type: 'email', placeholder: 'Enter email...' }} {template} />
<Story name="Password" args={{ type: 'password', placeholder: 'Enter password...' }} {template} />
<Story name="Disabled" args={{ disabled: true, placeholder: 'Disabled' }} {template} />
<Story name="Readonly" args={{ readonly: true, value: 'Read only value' }} {template} />
