<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageErrorAlert from './page-error-alert.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Shared/PageErrorAlert',
		component: PageErrorAlert,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			error: {
				control: 'text'
			}
		}
	});
</script>

{#snippet template(args)}
	<PageErrorAlert {...args} onDismiss={() => alert('Dismissed')} />
{/snippet}

<Story name="With Error" args={{ error: 'Failed to load data. Please try again.' }} {template} />

<Story
	name="Long Error Message"
	args={{
		error:
			'Connection timeout while fetching product details from remote API. The server may be experiencing high load. Please wait a moment and try again.'
	}}
	{template}
/>

<Story
	name="Technical Error"
	args={{ error: 'Error: ETIMEDOUT - Request timeout after 30000ms' }}
	{template}
/>

<Story name="No Error" args={{ error: null }} {template} />

{#snippet noDismissTemplate(args)}
	<PageErrorAlert {...args} />
{/snippet}

<Story
	name="Without Dismiss Button"
	args={{ error: 'This error cannot be dismissed' }}
	template={noDismissTemplate}
/>
