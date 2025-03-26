<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiRadio from '$lib/components/ui/ui-radio.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Radio',
		component: UiRadio,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			id: 'radio-option',
			name: 'radio-group',
			isSelected: false,
			onSelect: fn(),
			disabled: false
		}
	});
</script>

{#snippet template(args)}
	<div class="w-full max-w-md p-4">
		<UiRadio
			id={args.id}
			name={args.name}
			isSelected={args.isSelected}
			onSelect={args.onSelect}
			disabled={args.disabled}
			class={args.class}
		>
			{args.children}
		</UiRadio>
	</div>
{/snippet}

{#snippet radioGroupTemplate(args)}
	<div class="flex w-full max-w-md flex-col gap-3 p-4">
		<UiRadio
			id="option1"
			name="group"
			isSelected={args.selectedOption === 'option1'}
			onSelect={args.onSelect}
		>
			Option 1
		</UiRadio>
		<UiRadio
			id="option2"
			name="group"
			isSelected={args.selectedOption === 'option2'}
			onSelect={args.onSelect}
		>
			Option 2
		</UiRadio>
		<UiRadio
			id="option3"
			name="group"
			isSelected={args.selectedOption === 'option3'}
			onSelect={args.onSelect}
			disabled={true}
		>
			Option 3 (Disabled)
		</UiRadio>
	</div>
{/snippet}

<Story name="Default" children={template} args={{ children: 'Radio option' }} />

<Story
	name="Selected"
	children={template}
	args={{
		isSelected: true,
		children: 'Selected option'
	}}
/>

<Story
	name="Disabled"
	children={template}
	args={{
		disabled: true,
		children: 'Disabled option'
	}}
/>

<Story
	name="Selected and Disabled"
	children={template}
	args={{
		isSelected: true,
		disabled: true,
		children: 'Selected and disabled option'
	}}
/>

<Story
	name="Radio Group"
	children={radioGroupTemplate}
	args={{
		selectedOption: 'option1'
	}}
/>
