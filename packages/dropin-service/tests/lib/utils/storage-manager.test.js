import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveToStorage, loadFromStorage, removeFromStorage } from '$lib/utils/storage-manager.js';

describe('storage-manager', () => {
	let mockStorage;
	let mockLocalStorage;

	beforeEach(() => {
		mockStorage = {};
		mockLocalStorage = {
			getItem: vi.fn((key) => mockStorage[key] || null),
			setItem: vi.fn((key, value) => {
				mockStorage[key] = value;
			}),
			removeItem: vi.fn((key) => {
				delete mockStorage[key];
			})
		};

		vi.stubGlobal('window', { localStorage: mockLocalStorage });
		vi.stubGlobal('localStorage', mockLocalStorage);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('saveToStorage', () => {
		it('saves data to localStorage', () => {
			const data = { name: 'test', value: 123 };
			const result = saveToStorage('testKey', data);

			expect(result).toBe(true);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(data));
		});

		it('returns false when localStorage is not available', () => {
			vi.stubGlobal('window', undefined);
			vi.stubGlobal('localStorage', undefined);
			const result = saveToStorage('testKey', { data: 'test' });

			expect(result).toBe(false);
		});

		it('returns false when localStorage throws error', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			mockLocalStorage.setItem.mockImplementation(() => {
				throw new Error('Storage full');
			});

			const result = saveToStorage('testKey', { data: 'test' });

			expect(result).toBe(false);
			consoleSpy.mockRestore();
		});

		it('handles null values', () => {
			const result = saveToStorage('testKey', null);

			expect(result).toBe(true);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', 'null');
		});

		it('handles arrays', () => {
			const data = [1, 2, 3];
			const result = saveToStorage('testKey', data);

			expect(result).toBe(true);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', '[1,2,3]');
		});
	});

	describe('loadFromStorage', () => {
		it('loads data from localStorage', () => {
			const data = { name: 'test', value: 123 };
			mockStorage.testKey = JSON.stringify(data);

			const result = loadFromStorage('testKey');

			expect(result).toEqual(data);
		});

		it('returns null when key does not exist', () => {
			const result = loadFromStorage('nonexistent');

			expect(result).toBe(null);
		});

		it('returns null when localStorage is not available', () => {
			vi.stubGlobal('window', undefined);
			vi.stubGlobal('localStorage', undefined);
			const result = loadFromStorage('testKey');

			expect(result).toBe(null);
		});

		it('returns null when JSON parsing fails', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			mockLocalStorage.getItem.mockReturnValue('invalid json');

			const result = loadFromStorage('testKey');

			expect(result).toBe(null);
			consoleSpy.mockRestore();
		});

		it('handles arrays', () => {
			mockLocalStorage.getItem.mockReturnValue('[1,2,3]');

			const result = loadFromStorage('testKey');

			expect(result).toEqual([1, 2, 3]);
		});
	});

	describe('removeFromStorage', () => {
		it('removes data from localStorage', () => {
			mockStorage.testKey = 'value';
			const result = removeFromStorage('testKey');

			expect(result).toBe(true);
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
		});

		it('returns false when localStorage is not available', () => {
			vi.stubGlobal('window', undefined);
			vi.stubGlobal('localStorage', undefined);
			const result = removeFromStorage('testKey');

			expect(result).toBe(false);
		});

		it('returns false when removeItem throws error', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			mockLocalStorage.removeItem.mockImplementation(() => {
				throw new Error('Access denied');
			});

			const result = removeFromStorage('testKey');

			expect(result).toBe(false);
			consoleSpy.mockRestore();
		});
	});
});
