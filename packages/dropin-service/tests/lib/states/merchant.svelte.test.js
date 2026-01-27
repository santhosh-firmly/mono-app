import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeMerchant, getMerchant, resetMerchant } from '$lib/states/merchant.svelte.js';

describe('merchant state', () => {
	beforeEach(() => {
		resetMerchant();
	});

	afterEach(() => {
		resetMerchant();
	});

	describe('initializeMerchant', () => {
		it('returns merchant instance', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant(null);
				expect(merchant).toBeDefined();
			});
			cleanup();
		});

		it('handles null merchantPresentation', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant(null);
				expect(merchant.primaryColor).toBeNull();
				expect(merchant.actionColor).toBeNull();
				expect(merchant.largeLogo).toBeNull();
				expect(merchant.smallLogo).toBeNull();
			});
			cleanup();
		});

		it('handles merchantPresentation without theme', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					domain: 'test.com',
					termsOfUse: 'https://terms.com',
					privacyPolicy: 'https://privacy.com'
				});
				expect(merchant.termsOfUse).toBe('https://terms.com');
				expect(merchant.privacyPolicy).toBe('https://privacy.com');
				expect(merchant.primaryColor).toBeNull();
			});
			cleanup();
		});

		it('initializes merchant colors from merchantPresentation', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#FF0000',
							action: '#00FF00'
						},
						largeLogo: 'https://logo.com/large.png',
						smallLogo: 'https://logo.com/small.png'
					}
				});

				expect(merchant.primaryColor).toBe('#FF0000');
				expect(merchant.actionColor).toBe('#00FF00');
				expect(merchant.largeLogo).toBe('https://logo.com/large.png');
				expect(merchant.smallLogo).toBe('https://logo.com/small.png');
			});
			cleanup();
		});

		it('uses primary color as fallback for action color', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#FF0000'
						}
					}
				});

				expect(merchant.primaryColor).toBe('#FF0000');
				expect(merchant.actionColor).toBe('#FF0000');
			});
			cleanup();
		});

		it('detects dark primary color', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#000000'
						}
					}
				});

				expect(merchant.isPrimaryDark).toBe(true);
			});
			cleanup();
		});

		it('detects light primary color', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#FFFFFF'
						}
					}
				});

				expect(merchant.isPrimaryDark).toBe(false);
			});
			cleanup();
		});

		it('detects dark action color', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#FFFFFF',
							action: '#000000'
						}
					}
				});

				expect(merchant.isActionDark).toBe(true);
			});
			cleanup();
		});

		it('detects light action color', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#000000',
							action: '#FFFFFF'
						}
					}
				});

				expect(merchant.isActionDark).toBe(false);
			});
			cleanup();
		});
	});

	describe('getMerchant', () => {
		it('throws if merchant not initialized', () => {
			expect(() => getMerchant()).toThrow('Merchant not initialized');
		});

		it('returns initialized merchant', () => {
			const cleanup = $effect.root(() => {
				initializeMerchant(null);
				const merchant = getMerchant();
				expect(merchant).toBeDefined();
			});
			cleanup();
		});
	});

	describe('reset', () => {
		it('resets all merchant values', () => {
			const cleanup = $effect.root(() => {
				const merchant = initializeMerchant({
					theme: {
						colors: {
							primary: '#FF0000',
							action: '#00FF00'
						},
						largeLogo: 'https://logo.com/large.png',
						smallLogo: 'https://logo.com/small.png'
					},
					termsOfUse: 'https://terms.com',
					privacyPolicy: 'https://privacy.com'
				});

				merchant.reset();

				expect(merchant.primaryColor).toBeNull();
				expect(merchant.actionColor).toBeNull();
				expect(merchant.isPrimaryDark).toBe(false);
				expect(merchant.isActionDark).toBe(false);
				expect(merchant.largeLogo).toBeNull();
				expect(merchant.smallLogo).toBeNull();
				expect(merchant.termsOfUse).toBeNull();
				expect(merchant.privacyPolicy).toBeNull();
			});
			cleanup();
		});
	});
});
