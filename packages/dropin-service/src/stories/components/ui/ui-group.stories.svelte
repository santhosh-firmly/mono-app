<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiGroup from '$lib/components/ui/ui-group.svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Group',
		component: UiGroup,
		parameters: {
			layout: 'centered'
		},
		args: {
			horizontal: false
		}
	});
</script>

{#snippet template(args)}
	<div class="w-full max-w-md p-4">
		<UiGroup horizontal={args.horizontal}>
			<UiInput placeholder="First name" />
			<UiInput placeholder="Last name" />
			<UiInput placeholder="Email" />
		</UiGroup>
	</div>
{/snippet}

{#snippet horizontalTemplate()}
	<div class="w-full max-w-md p-4">
		<UiGroup>
			<UiInput placeholder="Email" />
			<UiGroup horizontal>
				<UiInput placeholder="First name" />
				<UiInput placeholder="Last name" />
			</UiGroup>
		</UiGroup>
	</div>
{/snippet}

<Story name="Vertical Stack" children={template} />

<Story
	name="Horizontal Stack"
	children={horizontalTemplate}
	args={{
		horizontal: true
	}}
/>
