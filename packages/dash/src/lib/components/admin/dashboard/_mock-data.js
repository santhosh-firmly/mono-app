/**
 * Mock data for admin dashboard Storybook stories.
 * Provides realistic sample data for all dashboard components.
 */

// Generate cumulative revenue data for a month
function generateCumulativeRevenueData(days, baseRevenue, variation) {
	let cumulative = 0;
	let cumulativeOrders = 0;
	return Array.from({ length: days }, (_, i) => {
		const dailyRevenue = baseRevenue + Math.random() * variation - variation / 2;
		const dailyOrders = Math.floor(dailyRevenue / 85); // avg order ~$85
		cumulative += dailyRevenue;
		cumulativeOrders += dailyOrders;
		return {
			day: i + 1,
			date: `Jan ${String(i + 1).padStart(2, '0')}`,
			revenue: Math.round(cumulative * 100) / 100,
			orders: cumulativeOrders
		};
	});
}

export const mockSummary = {
	totalRevenue: 245678.5,
	totalOrders: 1842,
	aov: 133.38,
	revenueChange: 12.5,
	ordersChange: 8.3,
	aovChange: 3.9
};

export const mockSummaryNegative = {
	totalRevenue: 145678.5,
	totalOrders: 1242,
	aov: 117.38,
	revenueChange: -8.2,
	ordersChange: -12.5,
	aovChange: 4.9
};

export const mockSummaryEmpty = {
	totalRevenue: 0,
	totalOrders: 0,
	aov: 0,
	revenueChange: 0,
	ordersChange: 0,
	aovChange: 0
};

export const mockRevenueChart = {
	currentMonth: generateCumulativeRevenueData(26, 8500, 3000),
	previousMonth: generateCumulativeRevenueData(31, 7800, 2800),
	currentMonthLabel: 'This month',
	previousMonthLabel: 'Last month'
};

export const mockRevenueChartEmpty = {
	currentMonth: [],
	previousMonth: [],
	currentMonthLabel: 'This month',
	previousMonthLabel: 'Last month'
};

export const mockTopMerchants = [
	{
		domain: 'luxe-fashion.myshopify.com',
		displayName: 'Luxe Fashion',
		revenue: 78450.25,
		orders: 523,
		aov: 150.0
	},
	{
		domain: 'tech-gadgets.myshopify.com',
		displayName: 'Tech Gadgets Pro',
		revenue: 56230.8,
		orders: 412,
		aov: 136.48
	},
	{
		domain: 'home-essentials.myshopify.com',
		displayName: 'Home Essentials',
		revenue: 43890.15,
		orders: 389,
		aov: 112.83
	},
	{
		domain: 'sports-outlet.myshopify.com',
		displayName: 'Sports Outlet',
		revenue: 38120.0,
		orders: 298,
		aov: 127.92
	},
	{
		domain: 'beauty-box.myshopify.com',
		displayName: 'Beauty Box Co',
		revenue: 28987.3,
		orders: 220,
		aov: 131.76
	}
];

export const mockTopDestinations = [
	{ appId: 'dest_001', displayName: 'Affirm', revenue: 95230.5, orders: 687, aov: 138.62 },
	{ appId: 'dest_002', displayName: 'Klarna', revenue: 72450.25, orders: 534, aov: 135.67 },
	{ appId: 'dest_003', displayName: 'Afterpay', revenue: 48120.0, orders: 398, aov: 120.9 },
	{
		appId: 'dest_004',
		displayName: 'PayPal Credit',
		revenue: 18890.15,
		orders: 145,
		aov: 130.28
	},
	{ appId: 'dest_005', displayName: 'Sezzle', revenue: 10987.6, orders: 78, aov: 140.87 }
];

export const mockTopProducts = [
	{
		name: 'Premium Wireless Headphones',
		quantity: 234,
		orders: 189,
		revenue: 46800.0,
		image: 'https://placehold.co/80x80/EEE/31343C?text=P1'
	},
	{
		name: 'Smart Watch Series X',
		quantity: 156,
		orders: 142,
		revenue: 38987.5,
		image: 'https://placehold.co/80x80/EEE/31343C?text=P2'
	},
	{
		name: 'Organic Cotton T-Shirt Bundle',
		quantity: 445,
		orders: 223,
		revenue: 26700.0,
		image: 'https://placehold.co/80x80/EEE/31343C?text=P3'
	},
	{
		name: 'Professional Yoga Mat',
		quantity: 312,
		orders: 298,
		revenue: 21840.0,
		image: null
	},
	{
		name: 'Stainless Steel Water Bottle',
		quantity: 567,
		orders: 445,
		revenue: 17010.0,
		image: null
	}
];

export const mockMerchants = [
	{ domain: 'luxe-fashion.myshopify.com', displayName: 'Luxe Fashion' },
	{ domain: 'tech-gadgets.myshopify.com', displayName: 'Tech Gadgets Pro' },
	{ domain: 'home-essentials.myshopify.com', displayName: 'Home Essentials' },
	{ domain: 'sports-outlet.myshopify.com', displayName: 'Sports Outlet' },
	{ domain: 'beauty-box.myshopify.com', displayName: 'Beauty Box Co' },
	{ domain: 'outdoor-adventures.myshopify.com', displayName: 'Outdoor Adventures' },
	{ domain: 'pet-paradise.myshopify.com', displayName: 'Pet Paradise' },
	{ domain: 'kids-corner.myshopify.com', displayName: "Kids' Corner" }
];

export const mockDestinations = [
	{ appId: 'dest_001', displayName: 'Affirm' },
	{ appId: 'dest_002', displayName: 'Klarna' },
	{ appId: 'dest_003', displayName: 'Afterpay' },
	{ appId: 'dest_004', displayName: 'PayPal Credit' },
	{ appId: 'dest_005', displayName: 'Sezzle' }
];

export const mockDashboardData = {
	summary: mockSummary,
	revenueChart: mockRevenueChart,
	topMerchants: mockTopMerchants,
	topDestinations: mockTopDestinations,
	topProducts: mockTopProducts,
	merchants: mockMerchants,
	destinations: mockDestinations,
	activeMerchants: 6,
	activeDestinations: 4
};

export const mockDashboardDataEmpty = {
	summary: mockSummaryEmpty,
	revenueChart: mockRevenueChartEmpty,
	topMerchants: [],
	topDestinations: [],
	topProducts: [],
	merchants: mockMerchants,
	destinations: mockDestinations,
	activeMerchants: 0,
	activeDestinations: 0
};
