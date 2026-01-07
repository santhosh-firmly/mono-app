import { env } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

let durable;

describe('MerchantDO', () => {
    beforeEach(async () => {
        durable = env.MERCHANT_DO.get(env.MERCHANT_DO.idFromName('test-merchant.com'));
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

    describe('Agreement', () => {
        it('should return unsigned agreement initially', async () => {
            const response = await durable.fetch('http://test/agreement', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.signed).toBe(false);
        });

        it('should sign agreement', async () => {
            const agreementData = {
                userId: 'user-123',
                userEmail: 'user@example.com',
                browserInfo: 'Chrome 120',
                clientIp: '127.0.0.1',
            };

            const response = await durable.fetch('http://test/agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agreementData),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/agreement', { method: 'GET' });
            const data = await getResponse.json();

            expect(data.signed).toBe(true);
            expect(data.agreement.signed_by_email).toBe('user@example.com');
        });

        it('should not allow signing agreement twice', async () => {
            const agreementData = {
                userId: 'user-123',
                userEmail: 'user@example.com',
            };

            await durable.fetch('http://test/agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agreementData),
            });

            const secondResponse = await durable.fetch('http://test/agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agreementData),
            });

            expect(secondResponse.status).toBe(400);
        });
    });

    describe('Onboarding Status', () => {
        it('should return empty onboarding status initially', async () => {
            const response = await durable.fetch('http://test/onboarding', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({});
        });

        it('should set onboarding task as completed', async () => {
            const response = await durable.fetch('http://test/onboarding/welcome_tour', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    completed: true,
                    userId: 'user-123',
                    userEmail: 'user@example.com',
                }),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/onboarding', { method: 'GET' });
            const data = await getResponse.json();

            expect(data.welcome_tour).toBeDefined();
            expect(data.welcome_tour.completed).toBe(true);
        });
    });

    describe('Catalog Config', () => {
        it('should return no config initially', async () => {
            const response = await durable.fetch('http://test/catalog-config', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.hasExistingConfig).toBe(false);
        });

        it('should set catalog config', async () => {
            const configData = {
                catalogType: 'manual',
                userId: 'user-123',
                userEmail: 'user@example.com',
            };

            const response = await durable.fetch('http://test/catalog-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/catalog-config', { method: 'GET' });
            const data = await getResponse.json();

            expect(data.hasExistingConfig).toBe(true);
            expect(data.catalogType).toBe('manual');
        });
    });

    describe('Integration Steps', () => {
        it('should return empty integration steps initially', async () => {
            const response = await durable.fetch('http://test/integration-steps', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual([]);
        });

        it('should update integration step', async () => {
            const stepData = {
                stepId: 'setup-sdk',
                status: 'completed',
                completedBy: 'user@example.com',
                source: 'dashboard',
            };

            const response = await durable.fetch('http://test/integration-steps', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stepData),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/integration-steps', { method: 'GET' });
            const steps = await getResponse.json();

            expect(steps.length).toBe(1);
            expect(steps[0].step_id).toBe('setup-sdk');
            expect(steps[0].status).toBe('completed');
        });

        it('should bulk update integration steps', async () => {
            const updates = {
                updates: [
                    { stepId: 'step-1', status: 'completed', source: 'api' },
                    { stepId: 'step-2', status: 'in-progress', source: 'api' },
                ],
            };

            const response = await durable.fetch('http://test/integration-steps/bulk', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.count).toBe(2);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await durable.fetch('http://test/unknown-route', { method: 'GET' });
            expect(response.status).toBe(404);
        });
    });
});
