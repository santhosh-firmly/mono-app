/**
 * Mock team data for Storybook stories
 */

export const mockTeamMembers = [
	{
		id: 'user_001',
		email: 'owner@example.com',
		name: 'Alice Johnson',
		role: 'owner',
		status: 'active',
		joined_at: '2024-01-15T10:00:00Z',
		avatar_url: null
	},
	{
		id: 'user_002',
		email: 'admin@example.com',
		name: 'Bob Smith',
		role: 'admin',
		status: 'active',
		joined_at: '2024-03-20T14:30:00Z',
		avatar_url: null
	},
	{
		id: 'user_003',
		email: 'member@example.com',
		name: 'Carol Williams',
		role: 'member',
		status: 'active',
		joined_at: '2024-06-10T09:15:00Z',
		avatar_url: null
	},
	{
		id: 'user_004',
		email: 'pending@example.com',
		name: null,
		role: 'member',
		status: 'pending',
		joined_at: null,
		avatar_url: null
	}
];

export const mockCurrentUser = {
	id: 'user_001',
	email: 'owner@example.com',
	name: 'Alice Johnson',
	role: 'owner'
};
