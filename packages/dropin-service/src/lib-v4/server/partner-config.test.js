import { describe, it, expect } from 'vitest';
import { detectPartner, getPartnerConfig, getPartnerInfo } from './partner-config.js';

describe('Partner Configuration', () => {
	describe('detectPartner', () => {
		it('should detect gannett partner from subdomain', () => {
			expect(detectPartner('gannett.firmly.com')).toBe('gannett');
		});

		it('should detect forbes partner from subdomain', () => {
			expect(detectPartner('forbes.firmly.com')).toBe('forbes');
		});

		it('should return null for unknown subdomain', () => {
			expect(detectPartner('unknown.firmly.com')).toBe(null);
		});

		it('should return null for domain without subdomain', () => {
			expect(detectPartner('firmly.com')).toBe(null);
		});

		it('should return null for null domain', () => {
			expect(detectPartner(null)).toBe(null);
		});

		it('should return null for undefined domain', () => {
			expect(detectPartner(undefined)).toBe(null);
		});
	});

	describe('getPartnerConfig', () => {
		it('should return gannett config', () => {
			const config = getPartnerConfig('gannett');
			expect(config).toEqual({
				id: 'gannett',
				name: 'USA TODAY',
				largeLogo: expect.stringContaining('data:image/svg+xml;base64'),
				smallLogo: null
			});
		});

		it('should return forbes config', () => {
			const config = getPartnerConfig('forbes');
			expect(config).toEqual({
				id: 'forbes',
				name: 'Forbes',
				largeLogo: expect.stringContaining('data:image/svg+xml'),
				smallLogo: null
			});
		});

		it('should return null for unknown partner', () => {
			expect(getPartnerConfig('unknown')).toBe(null);
		});

		it('should return null for null partner', () => {
			expect(getPartnerConfig(null)).toBe(null);
		});
	});

	describe('getPartnerInfo', () => {
		it('should return gannett partner info', () => {
			const result = getPartnerInfo('gannett.firmly.com');
			expect(result).toEqual({
				partnerId: 'gannett',
				partnerInfo: {
					largeLogo: expect.stringContaining('data:image/svg+xml;base64'),
					smallLogo: null,
					name: 'USA TODAY'
				}
			});
		});

		it('should return forbes partner info', () => {
			const result = getPartnerInfo('forbes.firmly.com');
			expect(result).toEqual({
				partnerId: 'forbes',
				partnerInfo: {
					largeLogo: expect.stringContaining('data:image/svg+xml'),
					smallLogo: null,
					name: 'Forbes'
				}
			});
		});

		it('should return default info for unknown domain', () => {
			const result = getPartnerInfo('unknown.firmly.com');
			expect(result).toEqual({
				partnerId: null,
				partnerInfo: null
			});
		});

		it('should return default info for non-partner domain', () => {
			const result = getPartnerInfo('firmly.com');
			expect(result).toEqual({
				partnerId: null,
				partnerInfo: null
			});
		});
	});
});
