<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiGroup from '$lib/components/ui/group.svelte';
	import UiInput from '$lib/components/ui/input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Group',
		component: UiGroup,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			horizontal: false
		},
		argTypes: {
			horizontal: {
				control: 'boolean',
				description: 'Whether the group layout is horizontal'
			}
		}
	});
</script>

<!-- Vertical Group (Default) -->
<Story name="Vertical">
	<UiInput placeholder="First Name" />
	<UiInput placeholder="Last Name" />
	<UiInput placeholder="Email" />
</Story>

<!-- Horizontal Group -->
<Story
	name="Horizontal"
	args={{
		horizontal: true
	}}
>
	<UiInput placeholder="City" />
	<UiInput placeholder="ZIP Code" />
</Story>
