<script>
	// @ts-ignore
	import Checkbox from './checkbox.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.scss';

	const title = 'This is the title text.';
	const subtitle = 'This is the subtitle text.';
	const isChecked = true;
</script>

<Meta title="Checkout V4/Common/Checkbox" component={Checkbox} tags={['autodocs']} />

<Template let:args>
	<Checkbox {...args} />
</Template>

<Story name="With Title and Subtitle" args={{ title, subtitle }} />
<Story name="With only Title" args={{ title }} />
<Story name="With Checkbox already Checked" args={{ title, subtitle, isChecked }} />
