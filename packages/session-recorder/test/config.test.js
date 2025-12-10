import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, mergeConfig } from '../src/config.js';

describe('config', () => {
	describe('mergeConfig', () => {
		it('should return default config when no user config provided', () => {
			const config = mergeConfig();
			expect(config).toEqual(DEFAULT_CONFIG);
		});

		it('should merge user config with defaults', () => {
			const userConfig = {
				batchInterval: 5000,
				maxEvents: 100
			};
			const config = mergeConfig(userConfig);

			expect(config.batchInterval).toBe(5000);
			expect(config.maxEvents).toBe(100);
			expect(config.maxBatchSize).toBe(DEFAULT_CONFIG.maxBatchSize);
		});

		it('should merge maskInputOptions deeply', () => {
			const userConfig = {
				maskInputOptions: {
					password: false,
					email: false
				}
			};
			const config = mergeConfig(userConfig);

			expect(config.maskInputOptions.password).toBe(false);
			expect(config.maskInputOptions.email).toBe(false);
			expect(config.maskInputOptions.text).toBe(true);
		});

		it('should merge sampling options deeply', () => {
			const userConfig = {
				sampling: {
					mousemove: true,
					scroll: 200
				}
			};
			const config = mergeConfig(userConfig);

			expect(config.sampling.mousemove).toBe(true);
			expect(config.sampling.scroll).toBe(200);
			expect(config.sampling.input).toBe('last');
		});

		it('should merge mouseInteraction options deeply', () => {
			const userConfig = {
				sampling: {
					mouseInteraction: {
						Click: false
					}
				}
			};
			const config = mergeConfig(userConfig);

			expect(config.sampling.mouseInteraction.Click).toBe(false);
			expect(config.sampling.mouseInteraction.DblClick).toBe(true);
			expect(config.sampling.mouseInteraction.Focus).toBe(true);
		});
	});
});
