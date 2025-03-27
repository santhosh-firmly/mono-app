<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CheckoutSummary from '$lib/components/checkout/checkout-summary.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Summary',
		component: CheckoutSummary,
		parameters: {
			layout: 'centered'
		},
		args: {
			hiddenLineItems: false,
			className: ''
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<CheckoutSummary {...args}>
			{#snippet summary()}
				{#if !args.hiddenLineItems}
					<p>Here the line items will be rendered!</p>
				{/if}
				<p>Here the summary component will be rendered!</p>
			{/snippet}
		</CheckoutSummary>
	</div>
{/snippet}

<Story name="Default" children={template} />
<Story name="Hidden Line Items" children={template} args={{ hiddenLineItems: true }} />
<Story name="Custom Class" children={template} args={{ className: 'bg-red-500' }} />
