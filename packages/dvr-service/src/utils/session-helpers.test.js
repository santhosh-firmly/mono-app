import { describe, it, expect } from 'vitest';
import { calculateSessionMetadata, extractUrlFromEvents } from './session-helpers.js';
import { EVENT_TYPES } from '../constants/events.js';

describe('calculateSessionMetadata', () => {
	it('should return default metadata for empty events array', () => {
		const result = calculateSessionMetadata([]);
		expect(result).toEqual({
			timestamp: expect.any(Number),
			duration: 0,
			eventCount: 0,
			url: 'Unknown'
		});
	});

	it('should return default metadata for null/undefined events', () => {
		const result1 = calculateSessionMetadata(null);
		const result2 = calculateSessionMetadata(undefined);
		
		expect(result1).toEqual({
			timestamp: expect.any(Number),
			duration: 0,
			eventCount: 0,
			url: 'Unknown'
		});
		expect(result2).toEqual(result1);
	});

	it('should calculate metadata from events', () => {
		const events = [
			{ type: 1, timestamp: 1000, data: {} },
			{ type: EVENT_TYPES.META, timestamp: 1200, data: { href: 'https://example.com' } },
			{ type: 2, timestamp: 1500, data: {} }
		];
		
		const result = calculateSessionMetadata(events);
		expect(result).toEqual({
			timestamp: 1000,
			duration: 500,
			eventCount: 3,
			url: 'https://example.com'
		});
	});

	it('should handle events without timestamps', () => {
		const events = [
			{ type: 1, data: {} },
			{ type: 2, data: {} }
		];
		
		const result = calculateSessionMetadata(events);
		expect(result).toEqual({
			timestamp: expect.any(Number),
			duration: 0,
			eventCount: 2,
			url: 'Unknown'
		});
	});
});

describe('extractUrlFromEvents', () => {
	it('should return Unknown for empty events array', () => {
		const result = extractUrlFromEvents([]);
		expect(result).toBe('Unknown');
	});

	it('should return Unknown for null/undefined events', () => {
		const result1 = extractUrlFromEvents(null);
		const result2 = extractUrlFromEvents(undefined);
		
		expect(result1).toBe('Unknown');
		expect(result2).toBe('Unknown');
	});

	it('should extract URL from META event', () => {
		const events = [
			{ type: 1, data: {} },
			{ type: EVENT_TYPES.META, data: { href: 'https://example.com/page' } },
			{ type: 2, data: {} }
		];
		
		const result = extractUrlFromEvents(events);
		expect(result).toBe('https://example.com/page');
	});

	it('should return Unknown when no META event with href', () => {
		const events = [
			{ type: 1, data: {} },
			{ type: EVENT_TYPES.META, data: {} },
			{ type: 2, data: {} }
		];
		
		const result = extractUrlFromEvents(events);
		expect(result).toBe('Unknown');
	});

	it('should return Unknown when META event has no data', () => {
		const events = [
			{ type: 1, data: {} },
			{ type: EVENT_TYPES.META },
			{ type: 2, data: {} }
		];
		
		const result = extractUrlFromEvents(events);
		expect(result).toBe('Unknown');
	});
});
