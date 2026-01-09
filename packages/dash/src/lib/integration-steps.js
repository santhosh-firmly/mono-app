/**
 * Integration steps definition - single source of truth.
 * This structure defines all integration steps and their substeps.
 *
 * Status values:
 * - 'pending': Not started
 * - 'in-progress': Currently being worked on
 * - 'completed': Finished
 *
 * For steps with substeps:
 * - Step status is derived from substep statuses
 * - 'completed' if ALL substeps are completed
 * - 'in-progress' if ANY substep is in-progress or completed (but not all completed)
 * - 'pending' if ALL substeps are pending
 */

// Placeholder steps - to be replaced with actual step definitions
export const INTEGRATION_STEPS = [
	{
		id: 'platform-identification',
		title: 'Platform identification',
		substeps: null
	},
	{
		id: 'content-integration',
		title: 'Content integration',
		substeps: null
	},
	{
		id: 'cart-integration',
		title: 'Cart integration',
		substeps: null
	},
	{
		id: 'shipping-integration',
		title: 'Shipping integration',
		substeps: null
	},
	{
		id: 'payment-integration',
		title: 'Payment integration',
		substeps: [
			{ id: 'credit-card', title: 'Credit card integration' },
			{ id: 'paypal', title: 'PayPal integration' }
		]
	},
	{
		id: 'final-setup',
		title: 'Final setup',
		substeps: null
	}
];

/**
 * Derive parent step status from substep statuses.
 * @param {Array<string>} substepStatuses - Array of substep status values
 * @returns {string} The derived parent status
 */
function deriveStepStatus(substepStatuses) {
	if (!substepStatuses || substepStatuses.length === 0) {
		return 'pending';
	}

	const allCompleted = substepStatuses.every((s) => s === 'completed');
	if (allCompleted) return 'completed';

	const anyStarted = substepStatuses.some((s) => s === 'completed' || s === 'in-progress');
	if (anyStarted) return 'in-progress';

	return 'pending';
}

/**
 * Build a full integration status object from database records and step definitions.
 * @param {Array<Object>} dbRecords - Records from the integration_steps table
 * @param {Array<Object>} stepDefinitions - The INTEGRATION_STEPS array
 * @returns {Object} Full status object with steps, progress, and completion flag
 */
export function buildIntegrationStatus(dbRecords, stepDefinitions = INTEGRATION_STEPS) {
	// Create a map for quick lookup of DB records
	const recordMap = new Map();
	for (const record of dbRecords) {
		const key = record.substep_id ? `${record.step_id}:${record.substep_id}` : record.step_id;
		recordMap.set(key, record);
	}

	// Build the full status object
	const steps = stepDefinitions.map((stepDef, index) => {
		if (stepDef.substeps) {
			// Step has substeps - build substep statuses and derive parent status
			const substeps = stepDef.substeps.map((substepDef) => {
				const key = `${stepDef.id}:${substepDef.id}`;
				const record = recordMap.get(key);

				return {
					id: substepDef.id,
					title: substepDef.title,
					status: record?.status || 'pending',
					completedAt: record?.completed_at || null,
					completedBy: record?.completed_by || null,
					source: record?.source || null
				};
			});

			const substepStatuses = substeps.map((s) => s.status);
			const derivedStatus = deriveStepStatus(substepStatuses);

			// For parent step, use the latest completion time from substeps if completed
			let parentCompletedAt = null;
			let parentCompletedBy = null;
			let parentSource = null;

			if (derivedStatus === 'completed') {
				const completedSubsteps = substeps.filter((s) => s.completedAt);
				if (completedSubsteps.length > 0) {
					const latestSubstep = completedSubsteps.reduce((latest, current) =>
						new Date(current.completedAt) > new Date(latest.completedAt)
							? current
							: latest
					);
					parentCompletedAt = latestSubstep.completedAt;
					parentCompletedBy = latestSubstep.completedBy;
					parentSource = latestSubstep.source;
				}
			}

			return {
				id: stepDef.id,
				title: stepDef.title,
				order: index + 1,
				status: derivedStatus,
				completedAt: parentCompletedAt,
				completedBy: parentCompletedBy,
				source: parentSource,
				substeps
			};
		} else {
			// Simple step without substeps
			const record = recordMap.get(stepDef.id);

			return {
				id: stepDef.id,
				title: stepDef.title,
				order: index + 1,
				status: record?.status || 'pending',
				completedAt: record?.completed_at || null,
				completedBy: record?.completed_by || null,
				source: record?.source || null,
				substeps: null
			};
		}
	});

	// Calculate overall progress
	const completedSteps = steps.filter((s) => s.status === 'completed').length;
	const totalSteps = steps.length;
	const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
	const isComplete = completedSteps === totalSteps && totalSteps > 0;

	return {
		steps,
		completedSteps,
		totalSteps,
		overallProgress,
		isComplete
	};
}
