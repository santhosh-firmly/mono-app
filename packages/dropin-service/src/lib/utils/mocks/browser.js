import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

// Only setup worker in browser environment
export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null;
