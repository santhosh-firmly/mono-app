<script context="module">
	import IntegrationProgress from './integration-progress.svelte';
	export const meta = {
		title: 'Merchant/Onboarding/Integration Progress',
		component: IntegrationProgress,
		parameters: {
			layout: 'padded',
			docs: {
				description: {
					component:
						'Displays integration progress for a merchant. Fetches real-time data from the `/merchant/{domain}/api/integration-status` endpoint on mount. When `isFirmlyAdmin` is true, completion timestamps are shown for each step.'
				}
			}
		},
		argTypes: {
			domain: {
				control: 'text',
				description: 'Merchant domain to fetch integration status for'
			},
			isFirmlyAdmin: {
				control: 'boolean',
				description: 'When true, shows completion timestamps for steps'
			}
		}
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default">
	<div class="max-w-md">
		<IntegrationProgress domain="merchant.com" />
	</div>
</Story>

<Story name="Admin View">
	<div class="max-w-md">
		<IntegrationProgress domain="merchant.com" isFirmlyAdmin={true} />
	</div>
</Story>

<Story name="Notes">
	<div class="max-w-lg space-y-4">
		<div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
			<h3 class="font-semibold text-amber-800">API Required</h3>
			<p class="mt-2 text-sm text-amber-700">
				This component fetches data from the API endpoint:
				<code class="rounded bg-amber-100 px-1"
					>/merchant/{'{domain}'}/api/integration-status</code
				>
			</p>
			<p class="mt-2 text-sm text-amber-700">
				In Storybook, the API will not be available, so you'll see the loading state
				followed by an error. To see the component in action, view it in the actual
				application.
			</p>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<h3 class="font-semibold text-gray-800">Component States</h3>
			<ul class="mt-2 space-y-2 text-sm text-gray-600">
				<li>
					<span class="font-medium">Loading:</span> Shows a spinner while fetching status
				</li>
				<li>
					<span class="font-medium">Error:</span> Shows error message if API call fails
				</li>
				<li>
					<span class="font-medium">Steps:</span> Shows progress bar and step list with status
					icons
				</li>
				<li>
					<span class="font-medium">Substeps:</span> Expands when parent step is in-progress
					or completed
				</li>
				<li>
					<span class="font-medium">Completion:</span> Shows success message when all steps
					done
				</li>
			</ul>
		</div>

		<div class="rounded-lg border border-purple-200 bg-purple-50 p-4">
			<h3 class="font-semibold text-purple-800">Admin Features</h3>
			<p class="mt-2 text-sm text-purple-700">
				When <code class="rounded bg-purple-100 px-1">isFirmlyAdmin=true</code>, completion
				timestamps are displayed next to each completed step and substep.
			</p>
		</div>
	</div>
</Story>
