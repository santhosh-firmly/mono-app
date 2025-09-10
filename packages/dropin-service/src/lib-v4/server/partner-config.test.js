import { describe, it, expect } from 'vitest';
import { detectPartner, getPartnerConfig, getPartnerInfo } from './partner-config.js';

describe('Partner Configuration', () => {
	describe('detectPartner', () => {
		it('should detect partner from subdomain', () => {
			expect(detectPartner('gannett.firmly.com')).toBe('gannett');
			expect(detectPartner('forbes.firmly.com')).toBe('forbes');
		});

		it('should return null for unknown or invalid domains', () => {
			expect(detectPartner('unknown.firmly.com')).toBe(null);
			expect(detectPartner('firmly.com')).toBe(null);
			expect(detectPartner(null)).toBe(null);
			expect(detectPartner(undefined)).toBe(null);
		});
	});

	describe('getPartnerConfig', () => {
		it('should return partner config when partner exists', () => {
			const config = getPartnerConfig('gannett');
			expect(config).toBeDefined();
			expect(config.id).toBe('gannett');
			expect(config).toHaveProperty('name');
			expect(config).toHaveProperty('largeLogo');
			expect(config).toHaveProperty('disclaimer');
			expect(config).toHaveProperty('buttonText');
		});

		it('should return null for unknown partner', () => {
			expect(getPartnerConfig('unknown')).toBe(null);
			expect(getPartnerConfig(null)).toBe(null);
		});
	});

	describe('getPartnerInfo', () => {
		it('should return partner info when domain matches', () => {
			const result = getPartnerInfo('gannett.firmly.com');
			expect(result.partnerId).toBe('gannett');
			expect(result.partnerInfo).toBeDefined();
			expect(result.partnerInfo).toHaveProperty('name');
			expect(result.partnerInfo).toHaveProperty('largeLogo');
		});

		it('should return null info for non-partner domains', () => {
			const result = getPartnerInfo('unknown.firmly.com');
			expect(result.partnerId).toBe(null);
			expect(result.partnerInfo).toBe(null);
		});

		it('should include disclaimer structure when present', () => {
			const result = getPartnerInfo('gannett.firmly.com');
			if (result.partnerInfo?.disclaimer) {
				expect(result.partnerInfo.disclaimer).toHaveProperty('text');
				expect(result.partnerInfo.disclaimer).toHaveProperty('links');
				expect(result.partnerInfo.disclaimer.links).toHaveProperty('termsOfService');
				expect(result.partnerInfo.disclaimer.links).toHaveProperty('privacyPolicy');
				expect(result.partnerInfo.disclaimer.links).toHaveProperty('ftcCompliance');
			}
		});
	});
});
