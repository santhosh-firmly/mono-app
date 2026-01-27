// Catalog API clients
// Re-export all catalog API modules

export { default as catalogApi } from './client.js';
export { default as productDetailsApi } from './product-details-client.js';
export { default as enrichmentApi } from './enrichment-client.js';
export { default as exportApi } from './export-client.js';
export { default as publishApi } from './publish-client.js';

// Named exports for direct access
export * from './client.js';
