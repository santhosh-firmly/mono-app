import { describe, it, expect } from 'vitest';
import { getLuminance } from '$lib/utils/color-utils.js';

describe('color-utils', () => {
	describe('getLuminance', () => {
		it('returns 0 for pure black', () => {
			expect(getLuminance('#000000')).toBe(0);
		});

		it('returns 1 for pure white', () => {
			expect(getLuminance('#FFFFFF')).toBe(1);
		});

		it('returns correct luminance for pure red', () => {
			const luminance = getLuminance('#FF0000');
			expect(luminance).toBeCloseTo(0.2126, 4);
		});

		it('returns correct luminance for pure green', () => {
			const luminance = getLuminance('#00FF00');
			expect(luminance).toBeCloseTo(0.7152, 4);
		});

		it('returns correct luminance for pure blue', () => {
			const luminance = getLuminance('#0000FF');
			expect(luminance).toBeCloseTo(0.0722, 4);
		});

		it('returns correct luminance for gray', () => {
			const luminance = getLuminance('#808080');
			expect(luminance).toBeGreaterThan(0);
			expect(luminance).toBeLessThan(1);
			expect(luminance).toBeCloseTo(0.5, 1);
		});

		it('handles lowercase hex values', () => {
			expect(getLuminance('#ffffff')).toBe(1);
			expect(getLuminance('#000000')).toBe(0);
		});

		it('returns value between 0 and 1 for any valid color', () => {
			const testColors = ['#123456', '#ABCDEF', '#FF5733', '#33FF57'];
			testColors.forEach((color) => {
				const luminance = getLuminance(color);
				expect(luminance).toBeGreaterThanOrEqual(0);
				expect(luminance).toBeLessThanOrEqual(1);
			});
		});
	});
});
