<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from './input.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Input',
		component: Input,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<Input {...args} />
	{/snippet}
</Story>

<Story name="With Placeholder" args={{ placeholder: 'Enter text here...' }}>
	{#snippet template(args)}
		<Input {...args} />
	{/snippet}
</Story>

<Story name="With Value">
	{#snippet template(args)}
		<Input {...args} value="Sample text" />
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template(args)}
		<Input {...args} placeholder="Disabled input" disabled />
	{/snippet}
</Story>

<Story name="Password">
	{#snippet template(args)}
		<Input {...args} type="password" placeholder="Enter password" />
	{/snippet}
</Story>
