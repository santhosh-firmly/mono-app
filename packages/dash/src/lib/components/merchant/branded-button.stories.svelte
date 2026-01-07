<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BrandedButton from './branded-button.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Branding/Branded Button',
		component: BrandedButton,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'tertiary'],
				description: 'Button variant style'
			},
			type: {
				control: 'select',
				options: ['button', 'submit', 'reset'],
				description: 'HTML button type'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the button is disabled'
			}
		}
	});
</script>

{#snippet template(args)}
	<div style="max-width: 300px;">
		<BrandedButton {...args}>
			{args.label || 'Button'}
		</BrandedButton>
	</div>
{/snippet}

<Story name="Primary" args={{ variant: 'primary', label: 'Primary Button' }} {template} />

<Story name="Secondary" args={{ variant: 'secondary', label: 'Secondary Button' }} {template} />

<Story name="Tertiary" args={{ variant: 'tertiary', label: 'Tertiary Button' }} {template} />

<Story
	name="Disabled Primary"
	args={{ variant: 'primary', disabled: true, label: 'Disabled Primary' }}
	{template}
/>

<Story
	name="Disabled Secondary"
	args={{ variant: 'secondary', disabled: true, label: 'Disabled Secondary' }}
	{template}
/>

<Story
	name="Disabled Tertiary"
	args={{ variant: 'tertiary', disabled: true, label: 'Disabled Tertiary' }}
	{template}
/>

<Story name="All Variants">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 1rem; max-width: 300px;">
			<BrandedButton variant="primary">Primary Button</BrandedButton>
			<BrandedButton variant="secondary">Secondary Button</BrandedButton>
			<BrandedButton variant="tertiary">Tertiary Button</BrandedButton>
			<BrandedButton variant="primary" disabled>Disabled Primary</BrandedButton>
			<BrandedButton variant="secondary" disabled>Disabled Secondary</BrandedButton>
			<BrandedButton variant="tertiary" disabled>Disabled Tertiary</BrandedButton>
		</div>
	{/snippet}
</Story>
