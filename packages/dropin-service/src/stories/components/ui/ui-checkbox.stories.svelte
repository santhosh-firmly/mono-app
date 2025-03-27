<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiCheckbox from '$lib/components/ui/ui-checkbox.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Checkbox',
		component: UiCheckbox,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			title: 'Default Checkbox',
			subtitle: '',
			isChecked: false,
			disabled: false,
			onChange: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-full max-w-md p-4">
		<UiCheckbox
			title={args.title}
			subtitle={args.subtitle}
			isChecked={args.isChecked}
			disabled={args.disabled}
			onChange={args.onChange}
		/>
	</div>
{/snippet}

<Story name="Default" children={template} />

<Story
	name="Checked"
	children={template}
	args={{
		isChecked: true
	}}
/>

<Story
	name="With Subtitle"
	children={template}
	args={{
		title: 'Newsletter',
		subtitle: 'Receive updates about our products'
	}}
/>

<Story
	name="Checked With Subtitle"
	children={template}
	args={{
		title: 'Accept Terms',
		subtitle: 'I agree to the terms and conditions',
		isChecked: true
	}}
/>

<Story
	name="Disabled"
	children={template}
	args={{
		title: 'Disabled Option',
		disabled: true
	}}
/>

<Story
	name="Disabled Checked"
	children={template}
	args={{
		title: 'Disabled Checked Option',
		subtitle: 'This option cannot be changed',
		isChecked: true,
		disabled: true
	}}
/>
