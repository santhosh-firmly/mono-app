<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import CheckCircle from 'lucide-svelte/icons/check-circle';

	/**
	 * @typedef {Object} KybStatus
	 * @property {'pending' | 'approved' | 'rejected' | null} [kyb_status]
	 * @property {string} [kyb_rejection_notes]
	 */

	let {
		/** @type {KybStatus} */
		kybStatus = null
	} = $props();
</script>

{#if kybStatus?.kyb_status === 'rejected'}
	<Card.Root class="border-red-200 bg-red-50">
		<Card.Content class="py-4">
			<div class="flex items-center gap-3">
				<AlertCircle class="h-5 w-5 flex-shrink-0 text-red-600" />
				<div>
					<p class="text-sm font-medium text-red-700">
						KYB Submission Cannot Be Approved
					</p>
					<p class="text-sm text-red-600">Reason: {kybStatus.kyb_rejection_notes}</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{:else if kybStatus?.kyb_status === 'pending'}
	<Card.Root class="border-amber-200 bg-amber-50">
		<Card.Content class="py-4">
			<div class="flex items-center gap-3">
				<Clock class="h-5 w-5 flex-shrink-0 text-amber-600" />
				<div>
					<p class="text-sm font-medium text-amber-700">KYB Review Pending</p>
					<p class="text-sm text-amber-600">
						Your business information is being reviewed by Firmly. This usually takes
						1-2 business days.
					</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{:else if kybStatus?.kyb_status === 'approved'}
	<Card.Root class="border-green-200 bg-green-50">
		<Card.Content class="py-4">
			<div class="flex items-center gap-3">
				<CheckCircle class="h-5 w-5 flex-shrink-0 text-green-600" />
				<div>
					<p class="text-sm font-medium text-green-700">Business Verified</p>
					<p class="text-sm text-green-600">
						Your business has been verified and approved.
					</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
