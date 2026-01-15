/**
 * Shared mock data for merchant onboarding flow stories
 */

export const mockUser = {
	id: 'user-123',
	name: 'John Doe',
	email: 'john@acme.com',
	hasAvatar: false
};

export const mockMerchantAccess = [
	{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' }
];

export const mockDestinationAccess = [];

export const domain = 'acme.com';
export const currentPath = '/merchant/acme.com';

// Onboarding status configurations for each step
export const onboardingStatuses = {
	// Step 1: New merchant, integration in progress
	start: {
		integration: 'in-progress',
		agreement: 'pending',
		kyb: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 2: Integration complete
	integrationComplete: {
		integration: 'completed',
		agreement: 'pending',
		kyb: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 3: Agreement signed
	agreementComplete: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'pending',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 4a: KYB submitted, pending approval
	kybPending: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'in-progress',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 4b: KYB rejected
	kybRejected: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'rejected',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 4c: KYB approved (unlocks remaining tasks)
	kybApproved: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'pending',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 5: Destinations configured
	destinationsComplete: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'pending',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 6: Catalog configured
	catalogComplete: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'pending',
		goLive: 'pending'
	},

	// Step 7: CDN whitelisted
	cdnComplete: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'pending'
	},

	// Step 8a: Go Live pending
	goLivePending: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'in-progress'
	},

	// Step 8b: Go Live rejected
	goLiveRejected: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'rejected'
	},

	// Step 9: All complete
	allComplete: {
		integration: 'completed',
		agreement: 'completed',
		kyb: 'completed',
		destinations: 'completed',
		catalog: 'completed',
		cdn: 'completed',
		goLive: 'completed'
	}
};

// KYB status mock data
export const kybStatusRejected = {
	kyb_status: 'rejected',
	kyb_rejection_notes:
		'Business registration documents are expired. Please upload current documents dated within the last 90 days.'
};

export const kybStatusDefault = {
	kyb_status: null,
	kyb_rejection_notes: null
};

// Go Live status mock data
export const goLiveStatusRejected = {
	go_live_status: 'rejected',
	go_live_rejection_notes:
		'Product images do not meet quality standards. Please ensure all images are at least 800x800 pixels with white background.'
};

export const goLiveStatusDefault = {
	go_live_status: null,
	go_live_rejection_notes: null
};

// Mock destinations data
export const mockDestinations = [
	{
		id: 'chatgpt',
		name: 'ChatGPT',
		orders: 0,
		aov: null,
		disputeRate: null,
		reputationScore: null,
		isActive: true,
		isComingSoon: false,
		canToggle: true
	},
	{
		id: 'claude',
		name: 'Claude',
		orders: 0,
		aov: null,
		disputeRate: null,
		reputationScore: null,
		isActive: true,
		isComingSoon: false,
		canToggle: true
	},
	{
		id: 'perplexity',
		name: 'Perplexity',
		orders: 0,
		aov: null,
		disputeRate: null,
		reputationScore: null,
		isActive: false,
		isComingSoon: false,
		canToggle: true
	},
	{
		id: 'gemini',
		name: 'Gemini',
		orders: 0,
		aov: null,
		disputeRate: null,
		reputationScore: null,
		isActive: false,
		isComingSoon: true,
		canToggle: false
	},
	{
		id: 'copilot',
		name: 'GitHub Copilot',
		orders: 0,
		aov: null,
		disputeRate: null,
		reputationScore: null,
		isActive: false,
		isComingSoon: true,
		canToggle: false
	}
];
