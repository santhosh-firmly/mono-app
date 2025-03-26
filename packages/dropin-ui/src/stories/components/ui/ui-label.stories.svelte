<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiLabel from '$lib/components/ui/ui-label.svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Label',
		component: UiLabel,
		parameters: {
			layout: 'centered'
		},
		args: {
			label: 'Field Label',
			errorMessage: ''
		}
	});
</script>

{#snippet template(args)}
	<div class="w-full max-w-md p-4">
		<UiLabel label={args.label} errorMessage={args.errorMessage}>
			<UiInput errorMessage={args.errorMessage} placeholder="Input field" />
		</UiLabel>
	</div>
{/snippet}

<Story name="Default" children={template} />

<Story
	name="With Error"
	children={template}
	args={{
		label: 'Password',
		errorMessage: 'Password is required'
	}}
/>

<Story
	name="Long Label"
	children={template}
	args={{
		label: 'This is a very long label that might wrap to multiple lines'
	}}
/>
