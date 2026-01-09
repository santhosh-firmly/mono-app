/**
 * Mock order data for Storybook stories
 */

export const mockOrdersList = [
	{
		id: 'ord_001',
		platform_order_number: '1045',
		shop_id: 'acme-store.com',
		display_name: 'Acme Store',
		status: 'Completed',
		created_dt: '2024-12-20T10:30:00Z',
		order_total: 234.5,
		items_count: 3
	},
	{
		id: 'ord_002',
		platform_order_number: '1044',
		shop_id: 'tech-gadgets.com',
		display_name: 'Tech Gadgets',
		status: 'Processing',
		created_dt: '2024-12-19T15:45:00Z',
		order_total: 89.99,
		items_count: 1
	},
	{
		id: 'ord_003',
		platform_order_number: '1043',
		shop_id: 'fashion-hub.com',
		display_name: 'Fashion Hub',
		status: 'Pending',
		created_dt: '2024-12-18T09:00:00Z',
		order_total: 156.0,
		items_count: 2
	},
	{
		id: 'ord_004',
		platform_order_number: '1042',
		shop_id: 'home-essentials.com',
		display_name: 'Home Essentials',
		status: 'Shipped',
		created_dt: '2024-12-17T14:20:00Z',
		order_total: 445.75,
		items_count: 5
	},
	{
		id: 'ord_005',
		platform_order_number: '1041',
		shop_id: 'sports-gear.com',
		display_name: 'Sports Gear',
		status: 'Cancelled',
		created_dt: '2024-12-16T11:00:00Z',
		order_total: 67.99,
		items_count: 1
	}
];
