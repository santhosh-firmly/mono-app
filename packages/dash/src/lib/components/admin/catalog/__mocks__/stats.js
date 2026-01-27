// Mock stats data

export const mockOverviewStats = {
	summary: {
		totalCategories: 156,
		totalMappings: 12500,
		uniqueDomains: 45,
		totalJobs: 234,
		completedJobs: 210,
		runningJobs: 3
	},
	enrichmentStats: {
		totalAliasHits: 45000,
		totalCacheHits: 32000,
		totalAiCalls: 8500
	}
};

export const mockExportStats = {
	totalExports: 89,
	lastExportDate: '2024-01-15T08:00:00Z',
	totalFilesGenerated: 450,
	totalSizeBytes: 1250000000
};

export const mockPublishStats = {
	totalPublished: 156,
	lastPublishDate: '2024-01-14T16:00:00Z',
	pendingPublish: 12
};

export const mockMigrationStats = {
	totalMigrated: 45000,
	pendingMigration: 1200,
	migrationErrors: 34
};

export const mockStorageStats = {
	totalFiles: 2340,
	totalSize: '4.2 GB',
	lastModified: '2024-01-15T10:30:00Z'
};

export const mockProductDetailsStats = {
	totalDomains: 45,
	totalProducts: 156000,
	successRate: 94.5,
	pendingProducts: 8500,
	failedProducts: 1200
};

export const mockVariantStats = {
	totalVariants: 45000,
	variantGroups: 12000,
	avgVariantsPerProduct: 3.75
};
