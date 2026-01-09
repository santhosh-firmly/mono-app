<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FirmlyLogo from './firmly-logo.svelte';

	const { Story } = defineMeta({
		title: 'Foundations/Iconography/Firmly Logo',
		component: FirmlyLogo,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			size: {
				control: 'select',
				options: ['sm', 'md', 'lg', 'xl'],
				description: 'Size of the logo'
			}
		}
	});
</script>

{#snippet template(args)}
	<FirmlyLogo {...args} />
{/snippet}

<Story name="Default" args={{}} {template} />

<Story name="Small" args={{ size: 'sm' }} {template} />

<Story name="Medium" args={{ size: 'md' }} {template} />

<Story name="Large" args={{ size: 'lg' }} {template} />

<Story name="Extra Large" args={{ size: 'xl' }} {template} />

{#snippet allSizesTemplate()}
	<div class="flex flex-col gap-4 items-start">
		<FirmlyLogo size="sm" />
		<FirmlyLogo size="md" />
		<FirmlyLogo size="lg" />
		<FirmlyLogo size="xl" />
	</div>
{/snippet}

<Story name="All Sizes" children={allSizesTemplate} />
