<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	const { Story } = defineMeta({
		title: 'Forms/Textarea',
		component: Textarea,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			value: { control: 'text' },
			placeholder: { control: 'text' },
			disabled: { control: 'boolean' },
			readonly: { control: 'boolean' },
			rows: { control: 'number' }
		}
	});
</script>

<script>
	let characterCountValue = $state('');
</script>

{#snippet template(args)}
	<Textarea {...args} />
{/snippet}

{#snippet characterCountTemplate(args)}
	<div class="space-y-2">
		<Textarea {...args} bind:value={characterCountValue} />
		<p class="text-sm text-muted-foreground">
			{characterCountValue.length} / 500 characters
		</p>
	</div>
{/snippet}

<Story name="Default" args={{}} {template} />

<Story name="With Placeholder" args={{ placeholder: 'Enter your message here...' }} {template} />

<Story
	name="Disabled"
	args={{ placeholder: 'This textarea is disabled', disabled: true }}
	{template}
/>

<Story
	name="With Character Count"
	args={{ placeholder: 'Type something...', maxlength: 500 }}
	template={characterCountTemplate}
/>

<Story name="Small (3 rows)" args={{ placeholder: 'Small textarea', rows: 3 }} {template} />

<Story name="Medium (5 rows)" args={{ placeholder: 'Medium textarea', rows: 5 }} {template} />

<Story name="Large (10 rows)" args={{ placeholder: 'Large textarea', rows: 10 }} {template} />
