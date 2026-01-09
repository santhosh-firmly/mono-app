import { env } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

let durable;

describe('DestinationDO', () => {
    beforeEach(async () => {
        durable = env.DESTINATION_DO.get(env.DESTINATION_DO.idFromName('test-destination-app'));
    });

    describe('Team', () => {
        it('should return empty team initially', async () => {
            const response = await durable.fetch('http://test/team', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual([]);
        });

        it('should add a team member', async () => {
            const teamMember = {
                userId: 'user-123',
                userEmail: 'user@example.com',
                role: 'admin',
                grantedBy: 'owner@example.com',
            };

            const response = await durable.fetch('http://test/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamMember),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/team', { method: 'GET' });
            const team = await getResponse.json();

            expect(team.length).toBe(1);
            expect(team[0].user_id).toBe('user-123');
            expect(team[0].user_email).toBe('user@example.com');
            expect(team[0].role).toBe('admin');
        });

        it('should update team member role', async () => {
            await durable.fetch('http://test/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-123',
                    userEmail: 'user@example.com',
                    role: 'viewer',
                }),
            });

            const updateResponse = await durable.fetch('http://test/team/user-123', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'admin' }),
            });

            expect(updateResponse.status).toBe(200);

            const getResponse = await durable.fetch('http://test/team', { method: 'GET' });
            const team = await getResponse.json();

            expect(team[0].role).toBe('admin');
        });

        it('should remove team member', async () => {
            await durable.fetch('http://test/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-123',
                    userEmail: 'user@example.com',
                    role: 'viewer',
                }),
            });

            const deleteResponse = await durable.fetch('http://test/team/user-123', {
                method: 'DELETE',
            });

            expect(deleteResponse.status).toBe(200);

            const getResponse = await durable.fetch('http://test/team', { method: 'GET' });
            const team = await getResponse.json();

            expect(team.length).toBe(0);
        });
    });

    describe('Audit Logs', () => {
        it('should create an audit log entry', async () => {
            const auditLog = {
                eventType: 'TEAM_MEMBER_ADDED',
                actorId: 'actor-123',
                actorEmail: 'actor@example.com',
                targetId: 'target-456',
                targetEmail: 'target@example.com',
                details: { role: 'admin' },
            };

            const response = await durable.fetch('http://test/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(auditLog),
            });

            expect(response.status).toBe(200);
        });

        it('should retrieve audit logs', async () => {
            await durable.fetch('http://test/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'TEST_EVENT',
                    actorId: 'actor-123',
                    actorEmail: 'actor@example.com',
                }),
            });

            const response = await durable.fetch('http://test/audit-logs?limit=10&offset=0', {
                method: 'GET',
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.logs).toBeDefined();
            expect(Array.isArray(data.logs)).toBe(true);
        });
    });

    describe('Profile', () => {
        it('should return empty profile initially', async () => {
            const response = await durable.fetch('http://test/profile', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({});
        });

        it('should update profile', async () => {
            const profileData = {
                displayName: 'Test Destination',
                description: 'A test destination app',
                contactEmail: 'contact@destination.com',
            };

            const response = await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/profile', { method: 'GET' });
            const profile = await getResponse.json();

            expect(profile.displayName).toBe('Test Destination');
            expect(profile.description).toBe('A test destination app');
            expect(profile.contactEmail).toBe('contact@destination.com');
        });

        it('should merge profile updates', async () => {
            await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: 'Original Name' }),
            });

            await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: 'New description' }),
            });

            const getResponse = await durable.fetch('http://test/profile', { method: 'GET' });
            const profile = await getResponse.json();

            expect(profile.displayName).toBe('Original Name');
            expect(profile.description).toBe('New description');
        });
    });

    describe('Invites', () => {
        it('should return empty invites initially', async () => {
            const response = await durable.fetch('http://test/invites', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual([]);
        });

        it('should create an invite', async () => {
            const inviteData = {
                email: 'invited@example.com',
                role: 'editor',
                invitedBy: 'owner-123',
                invitedByEmail: 'owner@example.com',
            };

            const response = await durable.fetch('http://test/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData),
            });

            expect(response.status).toBe(200);
            const invite = await response.json();

            expect(invite.email).toBe('invited@example.com');
            expect(invite.role).toBe('editor');
            expect(invite.invited_by).toBe('owner-123');
            expect(invite.id).toBeDefined();
        });

        it('should not allow duplicate invites for same email', async () => {
            const inviteData = {
                email: 'invited@example.com',
                role: 'editor',
            };

            await durable.fetch('http://test/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData),
            });

            const secondResponse = await durable.fetch('http://test/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData),
            });

            expect(secondResponse.status).toBe(400);
        });

        it('should not allow invite for existing team member', async () => {
            // Add team member
            await durable.fetch('http://test/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-123',
                    userEmail: 'existing@example.com',
                    role: 'viewer',
                }),
            });

            // Try to invite same email
            const inviteResponse = await durable.fetch('http://test/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'existing@example.com',
                    role: 'editor',
                }),
            });

            expect(inviteResponse.status).toBe(400);
        });

        it('should cancel an invite', async () => {
            const createResponse = await durable.fetch('http://test/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'cancel-me@example.com',
                    role: 'viewer',
                }),
            });

            const invite = await createResponse.json();

            const cancelResponse = await durable.fetch(`http://test/invites/${invite.id}`, {
                method: 'DELETE',
            });

            expect(cancelResponse.status).toBe(200);

            const listResponse = await durable.fetch('http://test/invites', { method: 'GET' });
            const invites = await listResponse.json();

            expect(invites.find((i) => i.id === invite.id)).toBeUndefined();
        });

        it('should return 404 when canceling non-existent invite', async () => {
            const response = await durable.fetch('http://test/invites/non-existent-id', {
                method: 'DELETE',
            });

            expect(response.status).toBe(404);
        });
    });

    describe('Reset', () => {
        it('should reset all destination data', async () => {
            // First, add some data
            await durable.fetch('http://test/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-123',
                    userEmail: 'user@example.com',
                    role: 'owner',
                }),
            });

            await durable.fetch('http://test/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'TEST_EVENT',
                    actorId: 'actor-123',
                    actorEmail: 'actor@example.com',
                }),
            });

            await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: 'Test Destination',
                }),
            });

            await durable.fetch('http://test/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invited@example.com',
                    role: 'editor',
                }),
            });

            // Reset
            const resetResponse = await durable.fetch('http://test/reset', {
                method: 'POST',
            });

            expect(resetResponse.status).toBe(200);
            const resetData = await resetResponse.json();
            expect(resetData.success).toBe(true);
            expect(resetData.clearedTeamMembers).toBeDefined();
            expect(resetData.clearedTeamMembers.length).toBe(1);
            expect(resetData.clearedTeamMembers[0].user_id).toBe('user-123');

            // Verify all data is cleared
            const teamResponse = await durable.fetch('http://test/team', { method: 'GET' });
            const team = await teamResponse.json();
            expect(team.length).toBe(0);

            const auditResponse = await durable.fetch('http://test/audit-logs', { method: 'GET' });
            const audit = await auditResponse.json();
            expect(audit.logs.length).toBe(0);

            const profileResponse = await durable.fetch('http://test/profile', { method: 'GET' });
            const profile = await profileResponse.json();
            expect(profile).toEqual({});

            const invitesResponse = await durable.fetch('http://test/invites', { method: 'GET' });
            const invites = await invitesResponse.json();
            expect(invites.length).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await durable.fetch('http://test/unknown-route', { method: 'GET' });
            expect(response.status).toBe(404);
        });
    });
});
