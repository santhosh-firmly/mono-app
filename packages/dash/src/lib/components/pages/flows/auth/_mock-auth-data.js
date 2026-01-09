/**
 * Shared mock data for auth flow stories
 */

export const mockNewUser = {
	id: 'user-new',
	name: '',
	email: 'newuser@example.com',
	hasAvatar: false
};

export const mockExistingUser = {
	id: 'user-123',
	name: 'John Doe',
	email: 'john@acme.com',
	hasAvatar: false
};

export const mockUserWithAvatar = {
	id: 'user-456',
	name: 'Jane Smith',
	email: 'jane@company.com',
	hasAvatar: true
};

// Single merchant access
export const singleMerchantAccess = [
	{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' }
];

// Multiple merchant access
export const multipleMerchantAccess = [
	{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
	{ domain: 'example.com', displayName: 'Example Store', role: 'admin' },
	{ domain: 'myshop.com', displayName: 'My Shop', role: 'viewer' }
];

// Single destination access
export const singleDestinationAccess = [
	{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' }
];

// Multiple destination access
export const multipleDestinationAccess = [
	{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
	{ appId: 'claude', displayName: 'Claude', role: 'admin' },
	{ appId: 'gemini', displayName: 'Gemini', role: 'viewer' }
];

// Mixed access (both merchants and destinations)
export const mixedAccessMerchants = [
	{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
	{ domain: 'example.com', displayName: 'Example Store', role: 'admin' }
];

export const mixedAccessDestinations = [
	{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
	{ appId: 'claude', displayName: 'Claude', role: 'admin' }
];

// Pending invites
export const mockPendingInvites = [
	{
		id: 'inv-1',
		merchant_domain: 'newstore.com',
		display_name: 'New Store Inc',
		invited_by_name: 'Sarah Wilson',
		role: 'admin',
		created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
	},
	{
		id: 'inv-2',
		app_id: 'perplexity',
		display_name: 'Perplexity AI',
		invited_by_name: 'Mike Johnson',
		role: 'viewer',
		created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
	}
];
