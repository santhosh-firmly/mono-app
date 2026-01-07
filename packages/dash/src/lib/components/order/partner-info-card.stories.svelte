<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import PartnerInfoCard from './partner-info-card.svelte';

	const { Story } = defineMeta({
		title: 'Orders/Partner Info Card',
		component: PartnerInfoCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			name: orderData.destinationName,
			title: 'Partner'
		},
		argTypes: {
			name: { control: 'text', description: 'Partner/destination name' },
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm">
		<PartnerInfoCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="Long Name" args={{ name: 'Very Long Partner Organization Name Inc.' }} {template} />

<Story name="Unknown Partner" args={{ name: '' }} {template} />
