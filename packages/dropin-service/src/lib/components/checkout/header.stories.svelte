<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Header from './header.svelte';
	import GoBack from './go-back.svelte';
	import SummaryResume from './summary-resume.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Header',
		component: Header,
		parameters: {
			layout: 'fullscreen',
			viewport: {
				defaultViewport: 'mobile2'
			}
		},
		args: {
			itemsQuantity: 3,
			totalPrice: 99.99
		},
		argTypes: {
			itemsQuantity: {
				control: 'number',
				description: 'Number of items in cart'
			},
			totalPrice: {
				control: 'number',
				description: 'Total cart price'
			}
		}
	});
</script>

<script>
	// Define snippet creators for each story variant
	const logoUrl = 'https://cdn.shopify.com/s/files/1/1515/2714/files/LiquidIV_Logo.png';
	const storeName = 'Liquid IV';
</script>

<!-- Mobile - Default (with logo, price, items) -->
{#snippet defaultTemplate(args)}
	{#snippet backButton()}
		<GoBack {logoUrl} {storeName} />
	{/snippet}
	{#snippet summary()}
		<SummaryResume
			total={99.99}
			subtotal={89.99}
			shipping={{ price: 5.0, description: 'Standard Shipping' }}
			tax={5.0}
		/>
	{/snippet}
	<Header {...args} {backButton} {summary} />
{/snippet}

<Story name="Mobile - Default" template={defaultTemplate} />

<!-- Mobile - Single Item -->
{#snippet singleItemTemplate(args)}
	{#snippet backButton()}
		<GoBack {logoUrl} {storeName} />
	{/snippet}
	{#snippet summary()}
		<SummaryResume
			total={29.99}
			subtotal={29.99}
			shipping={{ price: 0, description: 'Free Shipping' }}
			tax={0}
		/>
	{/snippet}
	<Header {...args} {backButton} {summary} />
{/snippet}

<Story
	name="Mobile - Single Item"
	args={{ itemsQuantity: 1, totalPrice: 29.99 }}
	template={singleItemTemplate}
/>

<!-- Mobile - Without Logo -->
{#snippet noLogoTemplate(args)}
	{#snippet backButton()}
		<GoBack {storeName} />
	{/snippet}
	{#snippet summary()}
		<SummaryResume
			total={59.99}
			subtotal={49.99}
			shipping={{ price: 5.0, description: 'Standard Shipping' }}
			tax={5.0}
		/>
	{/snippet}
	<Header {...args} {backButton} {summary} />
{/snippet}

<Story
	name="Mobile - Without Logo"
	args={{ itemsQuantity: 2, totalPrice: 59.99 }}
	template={noLogoTemplate}
/>

<!-- Mobile - Loading State -->
{#snippet loadingTemplate(args)}
	{#snippet backButton()}
		<GoBack isLoading={true} />
	{/snippet}
	{#snippet summary()}
		<SummaryResume isCalculating={true} />
	{/snippet}
	<Header {...args} {backButton} {summary} />
{/snippet}

<Story
	name="Mobile - Loading"
	args={{ itemsQuantity: 0, totalPrice: 0 }}
	template={loadingTemplate}
/>

<!-- Mobile - Without Summary -->
{#snippet noSummaryTemplate(args)}
	{#snippet backButton()}
		<GoBack {logoUrl} {storeName} />
	{/snippet}
	<Header {...args} {backButton} />
{/snippet}

<Story
	name="Mobile - Without Summary"
	args={{ itemsQuantity: 2, totalPrice: 59.99 }}
	template={noSummaryTemplate}
/>
