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
});
