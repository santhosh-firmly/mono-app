import { env } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

let durable;

describe('DashUserDO', () => {
    beforeEach(async () => {
        durable = env.DASH_USER_DO.get(env.DASH_USER_DO.idFromName('test-user-id'));
    });

    describe('Profile', () => {
        it('should return empty profile initially', async () => {
            const response = await durable.fetch('http://test/profile', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({});
        });

        it('should update and retrieve profile', async () => {
            const profileData = { name: 'Test User', email: 'test@example.com' };

            const putResponse = await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            expect(putResponse.status).toBe(200);

            const getResponse = await durable.fetch('http://test/profile', { method: 'GET' });
            const data = await getResponse.json();

            expect(data).toEqual(profileData);
        });

        it('should merge profile updates', async () => {
            await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User' }),
            });

            await durable.fetch('http://test/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com' }),
            });

            const response = await durable.fetch('http://test/profile', { method: 'GET' });
            const data = await response.json();

            expect(data).toEqual({ name: 'Test User', email: 'test@example.com' });
        });
    });

    describe('Sessions', () => {
        it('should create a session', async () => {
            const sessionData = {
                deviceName: 'Test Device',
                deviceType: 'desktop',
                ipAddress: '127.0.0.1',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };

            const response = await durable.fetch('http://test/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.sessionId).toBeDefined();
        });

        it('should list sessions', async () => {
            const sessionData = {
                deviceName: 'Test Device',
                deviceType: 'desktop',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };

            await durable.fetch('http://test/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });

            const response = await durable.fetch('http://test/sessions', { method: 'GET' });
            const sessions = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(sessions)).toBe(true);
            expect(sessions.length).toBeGreaterThan(0);
        });

        it('should validate a session', async () => {
            const sessionData = {
                deviceName: 'Test Device',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };

            const createResponse = await durable.fetch('http://test/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });
            const { sessionId } = await createResponse.json();

            const validateResponse = await durable.fetch(`http://test/sessions/${sessionId}`, {
                method: 'GET',
            });

            expect(validateResponse.status).toBe(200);
            const data = await validateResponse.json();
            expect(data.valid).toBe(true);
        });

        it('should terminate a session', async () => {
            const sessionData = {
                deviceName: 'Test Device',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };

            const createResponse = await durable.fetch('http://test/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });
            const { sessionId } = await createResponse.json();

            const deleteResponse = await durable.fetch(`http://test/sessions/${sessionId}`, {
                method: 'DELETE',
            });

            expect(deleteResponse.status).toBe(200);

            const validateResponse = await durable.fetch(`http://test/sessions/${sessionId}`, {
                method: 'GET',
            });
            expect(validateResponse.status).toBe(404);
        });
    });

    describe('Merchant Access', () => {
        it('should return empty merchant access initially', async () => {
            const response = await durable.fetch('http://test/merchant-access', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual([]);
        });

        it('should grant merchant access', async () => {
            const response = await durable.fetch('http://test/merchant-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantDomain: 'test-merchant.com', role: 'owner' }),
            });

            expect(response.status).toBe(200);

            const getResponse = await durable.fetch('http://test/merchant-access', { method: 'GET' });
            const access = await getResponse.json();

            expect(access.length).toBe(1);
            expect(access[0].merchant_domain).toBe('test-merchant.com');
            expect(access[0].role).toBe('owner');
        });

        it('should revoke merchant access', async () => {
            await durable.fetch('http://test/merchant-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantDomain: 'test-merchant.com', role: 'owner' }),
            });

            const deleteResponse = await durable.fetch('http://test/merchant-access/test-merchant.com', { method: 'DELETE' });

            expect(deleteResponse.status).toBe(200);

            const getResponse = await durable.fetch('http://test/merchant-access', { method: 'GET' });
            const access = await getResponse.json();
            expect(access.length).toBe(0);
        });
    });

    describe('Preferences', () => {
        it('should return empty preferences initially', async () => {
            const response = await durable.fetch('http://test/preferences', { method: 'GET' });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({});
        });

        it('should update and retrieve preferences', async () => {
            const preferences = { theme: 'dark', language: 'en' };

            await durable.fetch('http://test/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences),
            });

            const response = await durable.fetch('http://test/preferences', { method: 'GET' });
            const data = await response.json();

            expect(data).toEqual(preferences);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await durable.fetch('http://test/unknown-route', { method: 'GET' });
            expect(response.status).toBe(404);
        });
    });
});
