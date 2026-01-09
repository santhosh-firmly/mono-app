// Mock data for dashboard component stories

export const mockSummary = {
	totalRevenue: 45230.5,
	totalOrders: 156,
	aov: 290.07,
	revenueChange: 12.5,
	ordersChange: 8.3,
	aovChange: -2.1,
	weeklyRevenue: 12500,
	weeklyOrders: 42
};

export const mockSummaryNegative = {
	totalRevenue: 32100.0,
	totalOrders: 98,
	aov: 327.55,
	revenueChange: -15.2,
	ordersChange: -22.1,
	aovChange: 8.9,
	weeklyRevenue: 8200,
	weeklyOrders: 25
};

export const mockSummaryZero = {
	totalRevenue: 0,
	totalOrders: 0,
	aov: 0,
	revenueChange: 0,
	ordersChange: 0,
	aovChange: 0,
	weeklyRevenue: 0,
	weeklyOrders: 0
};

// Current month data (partial month - 10 days)
const mockCurrentMonthRevenue = [
	{ day: 1, date: 'Jan 01', revenue: 1200 },
	{ day: 2, date: 'Jan 02', revenue: 2400 },
	{ day: 3, date: 'Jan 03', revenue: 3100 },
	{ day: 4, date: 'Jan 04', revenue: 4200 },
	{ day: 5, date: 'Jan 05', revenue: 5500 },
	{ day: 6, date: 'Jan 06', revenue: 6800 },
	{ day: 7, date: 'Jan 07', revenue: 8200 },
	{ day: 8, date: 'Jan 08', revenue: 9100 },
	{ day: 9, date: 'Jan 09', revenue: 10500 },
	{ day: 10, date: 'Jan 10', revenue: 12200 }
];

// Previous month data (full month - 31 days)
const mockPreviousMonthRevenue = Array.from({ length: 31 }, (_, i) => ({
	day: i + 1,
	date: `Dec ${String(i + 1).padStart(2, '0')}`,
	revenue: Math.round(800 + i * 350)
}));

export const mockRevenueChart = {
	currentMonth: mockCurrentMonthRevenue,
	previousMonth: mockPreviousMonthRevenue,
	currentMonthLabel: 'This month',
	previousMonthLabel: 'Last month'
};

export const mockRevenueChartNoComparison = {
	currentMonth: mockCurrentMonthRevenue,
	previousMonth: [],
	currentMonthLabel: 'This month',
	previousMonthLabel: 'Last month'
};

export const mockRevenueChartEmpty = {
	currentMonth: [],
	previousMonth: [],
	currentMonthLabel: 'This month',
	previousMonthLabel: 'Last month'
};

export const mockDestinationChart = [
	{ id: 'shopify', name: 'Shopify', revenue: 18500, orders: 62, aov: 298.39 },
	{ id: 'woocommerce', name: 'WooCommerce', revenue: 12300, orders: 45, aov: 273.33 },
	{ id: 'bigcommerce', name: 'BigCommerce', revenue: 8900, orders: 32, aov: 278.13 },
	{ id: 'magento', name: 'Magento', revenue: 5530, orders: 17, aov: 325.29 }
];

export const mockDestinationChartEmpty = [];

export const mockTopProducts = [
	{ id: 'prod-1', name: 'Premium Widget Pro', quantity: 45, orders: 38, revenue: 8955 },
	{ id: 'prod-2', name: 'Classic Widget', quantity: 32, orders: 28, revenue: 4480 },
	{ id: 'prod-3', name: 'Widget Starter Kit', quantity: 28, orders: 25, revenue: 2800 },
	{ id: 'prod-4', name: 'Widget Accessories Bundle', quantity: 22, orders: 18, revenue: 1980 },
	{ id: 'prod-5', name: 'Widget Replacement Parts', quantity: 15, orders: 12, revenue: 750 }
];

export const mockTopProductsEmpty = [];

export const mockRecentOrders = [
	{
		id: 'ORD-2024-001234',
		destination: 'Shopify',
		amount: 299.99,
		date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
		itemCount: 3
	},
	{
		id: 'ORD-2024-001233',
		destination: 'WooCommerce',
		amount: 149.5,
		date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
		itemCount: 1
	},
	{
		id: 'ORD-2024-001232',
		destination: 'Shopify',
		amount: 450.0,
		date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
		itemCount: 5
	},
	{
		id: 'ORD-2024-001231',
		destination: 'BigCommerce',
		amount: 89.99,
		date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
		itemCount: 2
	},
	{
		id: 'ORD-2024-001230',
		destination: 'Magento',
		amount: 599.0,
		date: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
		itemCount: 4
	}
];

export const mockRecentOrdersEmpty = [];

// Full dashboard data object
export const mockDashboardData = {
	summary: mockSummary,
	revenueChart: mockRevenueChart,
	destinationChart: mockDestinationChart,
	topProducts: mockTopProducts,
	recentOrders: mockRecentOrders,
	activeDestinations: 4
};

export const mockDashboardDataEmpty = {
	summary: mockSummaryZero,
	revenueChart: mockRevenueChartEmpty,
	destinationChart: mockDestinationChartEmpty,
	topProducts: mockTopProductsEmpty,
	recentOrders: mockRecentOrdersEmpty,
	activeDestinations: 0
};
