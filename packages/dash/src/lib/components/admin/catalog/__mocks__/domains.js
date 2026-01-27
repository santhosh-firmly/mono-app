// Mock domain data

export const mockDomains = [
	{
		domain: 'acme-store.com',
		countryCode: 'US',
		total: 15420,
		pending: 234,
		success: 14986,
		failed: 150,
		permanently_failed: 50,
		completion_percent: 97
	},
	{
		domain: 'widgets-inc.com',
		countryCode: 'US',
		total: 8750,
		pending: 0,
		success: 8700,
		failed: 30,
		permanently_failed: 20,
		completion_percent: 100
	},
	{
		domain: 'gadgets-world.com',
		countryCode: 'UK',
		total: 5230,
		pending: 1500,
		success: 3500,
		failed: 180,
		permanently_failed: 50,
		completion_percent: 67
	},
	{
		domain: 'tech-emporium.com',
		countryCode: 'US',
		total: 22100,
		pending: 5000,
		success: 16500,
		failed: 400,
		permanently_failed: 200,
		completion_percent: 75
	},
	{
		domain: 'fashion-hub.com',
		countryCode: 'DE',
		total: 12340,
		pending: 0,
		success: 12340,
		failed: 0,
		permanently_failed: 0,
		completion_percent: 100
	}
];

export const mockDomainsEmpty = [];

export const mockDomainStats = {
	total_domains: 5,
	aggregate: {
		total_products: 63840,
		pending: 6734,
		success: 56026,
		failed: 760,
		permanently_failed: 320,
		completion_percent: 88
	},
	domains: mockDomains
};
