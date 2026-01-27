// Mock product data

export const mockProducts = [
	{
		id: 'prod-001',
		sku: 'SKU-12345',
		name: 'Wireless Bluetooth Headphones',
		price: 79.99,
		category: 'Electronics',
		type: 'Headphones',
		status: 'success',
		lastUpdated: '2024-01-15T10:30:00Z'
	},
	{
		id: 'prod-002',
		sku: 'SKU-12346',
		name: 'USB-C Charging Cable 2m',
		price: 14.99,
		category: 'Electronics',
		type: 'Cables',
		status: 'success',
		lastUpdated: '2024-01-14T15:45:00Z'
	},
	{
		id: 'prod-003',
		sku: 'SKU-12347',
		name: 'Leather Wallet',
		price: 49.99,
		category: 'Accessories',
		type: 'Wallets',
		status: 'pending',
		lastUpdated: '2024-01-13T09:20:00Z'
	},
	{
		id: 'prod-004',
		sku: 'SKU-12348',
		name: 'Running Shoes Size 10',
		price: 129.99,
		category: 'Footwear',
		type: 'Athletic Shoes',
		status: 'failed',
		lastUpdated: '2024-01-12T11:00:00Z'
	},
	{
		id: 'prod-005',
		sku: 'SKU-12349',
		name: 'Cotton T-Shirt Large',
		price: 24.99,
		category: 'Apparel',
		type: 'T-Shirts',
		status: 'success',
		lastUpdated: '2024-01-11T16:30:00Z'
	}
];

export const mockCategories = [
	{ name: 'Electronics', product_count: 12500, aliases: ['Tech', 'Gadgets', 'Devices'] },
	{ name: 'Apparel', product_count: 8900, aliases: ['Clothing', 'Fashion', 'Wear'] },
	{ name: 'Footwear', product_count: 4200, aliases: ['Shoes', 'Boots', 'Sneakers'] },
	{ name: 'Accessories', product_count: 6700, aliases: ['Bags', 'Wallets', 'Jewelry'] },
	{ name: 'Home & Garden', product_count: 9800, aliases: ['Home', 'Garden', 'Decor'] },
	{ name: 'Sports & Outdoors', product_count: 5400, aliases: ['Sports', 'Outdoor', 'Fitness'] }
];
