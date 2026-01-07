import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('rrweb', () => ({
	record: vi.fn()
}));

import { Recorder } from '../src/recorder.js';
import { record } from 'rrweb';

describe('Recorder', () => {
	let recorder;
	let mockConfig;
	let mockOnEvent;
	let mockStopFn;

	beforeEach(() => {
		mockOnEvent = vi.fn();
		mockStopFn = vi.fn();

		vi.mocked(record).mockReturnValue(mockStopFn);

		mockConfig = {
			maskAll: false,
			checkoutEveryNth: 100,
			checkoutEveryNms: 600000,
			blockSelector: null,
			inlineStylesheet: true,
			maskTextSelector: '[data-sensitive]',
			sampling: {
				mousemove: false,
				scroll: 150,
				input: 'last'
			}
		};

		recorder = new Recorder(mockConfig, mockOnEvent);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with config and callback', () => {
			expect(recorder.config).toBe(mockConfig);
			expect(recorder.onEvent).toBe(mockOnEvent);
			expect(recorder.stopRecording).toBeNull();
		});
	});

	describe('start', () => {
		it('should start recording and return stop function', () => {
			const stopFn = recorder.start();
			expect(stopFn).toBe(mockStopFn);
			expect(recorder.stopRecording).toBe(mockStopFn);
		});

		it('should configure rrweb with correct options when maskAll is false', () => {
			recorder.start();

			expect(record).toHaveBeenCalledWith(
				expect.objectContaining({
					emit: mockOnEvent,
					checkoutEveryNth: 100,
					checkoutEveryNms: 600000,
					maskAllInputs: false,
					blockSelector: null,
					inlineStylesheet: true,
					maskTextSelector: '[data-sensitive]',
					sampling: mockConfig.sampling
				})
			);
		});

		it('should configure rrweb with masking when maskAll is true', () => {
			mockConfig.maskAll = true;
			recorder = new Recorder(mockConfig, mockOnEvent);
			recorder.start();

			expect(record).toHaveBeenCalledWith(
				expect.objectContaining({
					maskAllInputs: true,
					maskTextClass: expect.any(RegExp),
					maskTextFn: expect.any(Function),
					maskInputFn: expect.any(Function)
				})
			);
		});

		it('should mask text with asterisks when maskAll is true', () => {
			mockConfig.maskAll = true;
			recorder = new Recorder(mockConfig, mockOnEvent);
			recorder.start();

			const call = vi.mocked(record).mock.calls[0][0];
			expect(call.maskTextFn('hello')).toBe('*****');
			expect(call.maskInputFn('password')).toBe('********');
		});
	});

	describe('stop', () => {
		it('should call stop function if recording is active', () => {
			recorder.start();
			recorder.stop();

			expect(mockStopFn).toHaveBeenCalled();
			expect(recorder.stopRecording).toBeNull();
		});

		it('should handle stop when not recording', () => {
			expect(() => recorder.stop()).not.toThrow();
		});

		it('should handle stop when stopRecording is null', () => {
			recorder.stopRecording = null;
			expect(() => recorder.stop()).not.toThrow();
		});
	});
});
