import { describe, it, expect } from 'vitest';
import { getNestedUrlParam } from './utils.js';

describe('getNestedUrlParam', () => {
	it('should extract nested URL with all query parameters', () => {
		const fullUrl =
			'https://firmly.dev/buy?url=https://firmlyai-impact.myshopify.com/products/5-pocket-jean?utm_campaign=USA+Today&utm_content=USA+TODAY&utm_medium=affiliate&utm_source=impact&impacttest=1&irclickid=TmRQOuUWpxycW3Q3SSwgbWSdUkpzY8SuZUZJ3w0&sharedid=firmly-ai-test&irpid=1111&irgwc=1';
		const expected =
			'https://firmlyai-impact.myshopify.com/products/5-pocket-jean?utm_campaign=USA+Today&utm_content=USA+TODAY&utm_medium=affiliate&utm_source=impact&impacttest=1&irclickid=TmRQOuUWpxycW3Q3SSwgbWSdUkpzY8SuZUZJ3w0&sharedid=firmly-ai-test&irpid=1111&irgwc=1';

		const result = getNestedUrlParam(fullUrl);
		expect(result).toBe(expected);
	});

	it('should extract only the URL parameter and ignore other parameters like ui_mode', () => {
		const fullUrl =
			'https://dropin.firmly.dev/buy?url=https%3A%2F%2Favenlur.com%2Fproducts%2Fhazel-foldable-pikler-triangle-ladder&ui_mode=sidebar';
		const expected = 'https://avenlur.com/products/hazel-foldable-pikler-triangle-ladder';

		const result = getNestedUrlParam(fullUrl);
		expect(result).toBe(expected);
	});

	it('should handle multiple parameters after the URL parameter', () => {
		const fullUrl =
			'https://dropin.firmly.dev/buy?url=https%3A%2F%2Fexample.com%2Fpage&theme=dark&lang=en';
		const expected = 'https://example.com/page';

		const result = getNestedUrlParam(fullUrl);
		expect(result).toBe(expected);
	});

	it('should handle URL parameter with query parameters in the middle of other parameters', () => {
		const fullUrl =
			'https://dropin.firmly.dev/buy?start=true&url=https%3A%2F%2Fshop.com%2Fitem%3Fid%3D123&end=true';
		const expected = 'https://shop.com/item?id=123';

		const result = getNestedUrlParam(fullUrl);
		expect(result).toBe(expected);
	});

	it('should return null when URL parameter is not found', () => {
		const fullUrl = 'https://dropin.firmly.dev/buy?theme=dark&lang=en';

		const result = getNestedUrlParam(fullUrl);
		expect(result).toBe(null);
	});
});
