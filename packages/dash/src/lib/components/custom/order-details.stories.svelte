<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrderDetails from './order-details.svelte';

	const { Story } = defineMeta({
		title: 'Dev Tools/Order Details',
		component: OrderDetails,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-md">
		<OrderDetails {...args} />
	</div>
{/snippet}

<Story
	name="Complete Order"
	args={{
		order: {
			shop_id: 'example-store.com',
			merchant_display_name: 'Example Store',
			status: 'Completed',
			partner_display_name: 'Amazon',
			platform_order_number: 'ORD-2024-12345',
			created_dt: new Date().toISOString(),
			order_total: 149.99,
			order_info: {
				line_items: [
					{
						description: 'Wireless Bluetooth Headphones',
						quantity: 1,
						line_price: { value: 79.99 },
						images: [{ url: '/images/placeholder.svg' }]
					},
					{
						description: 'USB-C Charging Cable',
						quantity: 2,
						line_price: { value: 29.98 },
						images: [{ url: '/images/placeholder.svg' }]
					}
				],
				sub_total: 109.97,
				cart_discount: { value: 10.0 },
				shipping_total: 9.99,
				tax: 8.03,
				total: 117.99,
				shipping_info: {
					city: 'San Francisco',
					state_or_province: 'CA',
					postal_code: '94102',
					email: 'customer@example.com',
					phone: '+1 (555) 123-4567'
				},
				payment_summary: {
					card_type: 'Visa',
					last_four: '4242'
				}
			}
		}
	}}
	{template}
/>

<Story
	name="Minimal Order"
	args={{
		order: {
			shop_id: 'simple-shop.com',
			status: 'Pending',
			platform_order_number: 'ORD-001',
			created_dt: new Date().toISOString(),
			order_info: {
				line_items: [
					{
						name: 'Product Item',
						quantity: 1,
						line_price: 25.0
					}
				],
				sub_total: 25.0,
				shipping_total: 5.0,
				tax: 2.5,
				total: 32.5,
				shipping_info: {
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001'
				}
			}
		}
	}}
	{template}
/>

<Story
	name="With Discount"
	args={{
		order: {
			shop_id: 'discount-store.com',
			merchant_display_name: 'Discount Store',
			status: 'Processing',
			platform_order_number: 'DSC-9999',
			created_dt: new Date().toISOString(),
			order_info: {
				line_items: [
					{
						description: 'Premium Widget',
						quantity: 3,
						line_price: { value: 150.0 }
					}
				],
				sub_total: 150.0,
				cart_discount: { value: 30.0 },
				shipping_total: 0,
				tax: 9.6,
				total: 129.6,
				shipping_info: {
					city: 'Austin',
					state_or_province: 'TX',
					postal_code: '78701',
					email: 'shopper@email.com'
				}
			}
		}
	}}
	{template}
/>
