// Mock workflow data

export const mockWorkflows = [
	{
		id: 'wf-001',
		domain: 'acme-store.com',
		countryCode: 'US',
		workflow_type: 'product-details',
		status: 'running',
		total_products: 15420,
		processed: 8500,
		started_at: '2024-01-15T10:00:00Z'
	},
	{
		id: 'wf-002',
		domain: 'widgets-inc.com',
		countryCode: 'US',
		workflow_type: 'enrichment',
		status: 'complete',
		total_products: 8750,
		processed: 8750,
		started_at: '2024-01-14T09:00:00Z',
		completed_at: '2024-01-14T11:30:00Z'
	},
	{
		id: 'wf-003',
		domain: 'gadgets-world.com',
		countryCode: 'UK',
		workflow_type: 'product-details',
		status: 'failed',
		total_products: 5230,
		processed: 2100,
		started_at: '2024-01-13T14:00:00Z',
		error_message: 'Rate limit exceeded'
	}
];

export const mockRunningWorkflows = {
	total: 2,
	workflows: [
		{
			domain: 'acme-store.com',
			countryCode: 'US',
			workflow_type: 'product-details',
			total_products: 15420,
			processed: 8500
		},
		{
			domain: 'tech-emporium.com',
			countryCode: 'US',
			workflow_type: 'enrichment',
			total_products: 22100,
			processed: 5000
		}
	]
};

export const mockJobs = [
	{
		id: 'job-001',
		domain: 'acme-store.com',
		countryCode: 'US',
		status: 'running',
		trigger_type: 'manual',
		total_products: 15420,
		processed_products: 8500,
		created_at: '2024-01-15T10:00:00Z',
		started_at: '2024-01-15T10:01:00Z'
	},
	{
		id: 'job-002',
		domain: 'widgets-inc.com',
		countryCode: 'US',
		status: 'completed',
		trigger_type: 'scheduled',
		total_products: 8750,
		processed_products: 8750,
		created_at: '2024-01-14T09:00:00Z',
		started_at: '2024-01-14T09:01:00Z',
		completed_at: '2024-01-14T11:30:00Z'
	},
	{
		id: 'job-003',
		domain: 'gadgets-world.com',
		countryCode: 'UK',
		status: 'failed',
		trigger_type: 'manual',
		total_products: 5230,
		processed_products: 2100,
		created_at: '2024-01-13T14:00:00Z',
		started_at: '2024-01-13T14:01:00Z',
		error_message: 'Rate limit exceeded'
	}
];
