<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiInput from '$lib/components/ui/ui-input.svelte';
	import { creditCardMask } from '$lib/utils/masks';

	const { Story } = defineMeta({
		title: 'Components/UI/Input',
		component: UiInput,
		parameters: {
			layout: 'centered'
		},
		args: {
			value: '',
			placeholder: 'Type something...',
			errorMessage: '',
			onlyNumbers: false,
			onChange: fn(),
			onPressEnter: fn(),
			clickoutside: fn(),
			onInput: fn()
		}
	});
</script>

<Story name="Error">
	<UiInput
		value="Error Input"
		placeholder="Error Placeholder"
		errorMessage="Error Message"
		onlyNumbers={false}
		onChange={fn()}
	/>
</Story>

<Story name="Only Numbers">
	<UiInput value="1234567890" placeholder="Only Numbers Placeholder" onlyNumbers={true} />
</Story>

<Story name="Disabled">
	<UiInput
		value="Disabled Input"
		placeholder="Disabled Placeholder"
		disabled={true}
		onChange={fn()}
		onPressEnter={fn()}
		clickoutside={fn()}
	/>
</Story>

<Story name="With Suffix">
	<UiInput
		value="Suffix Input"
		placeholder="Suffix Placeholder"
		onChange={fn()}
		onPressEnter={fn()}
		clickoutside={fn()}
	>
		{#snippet suffix()}
			<p>🇧🇷</p>
		{/snippet}
	</UiInput>
</Story>

<Story name="With Prefix">
	<UiInput
		value="Prefix Input"
		placeholder="Prefix Placeholder"
		onChange={fn()}
		onPressEnter={fn()}
		clickoutside={fn()}
	>
		{#snippet prefix()}
			<p>🇺🇸</p>
		{/snippet}
	</UiInput>
</Story>

<Story name="With Mask">
	<UiInput
		value="4111111111111111"
		onlyNumbers={true}
		placeholder="Mask Placeholder"
		mask={creditCardMask}
	>
		{#snippet prefix()}
			<p>💳</p>
		{/snippet}
	</UiInput>
</Story>
