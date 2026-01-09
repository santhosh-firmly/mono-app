<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DestinationsPage from '$lib/components/pages/merchant/destinations-page.svelte';

	let domain = $derived($page.params.domain);

	// State
	let destinations = $state([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let hasExistingConfig = $state(false);

	// Track original state to detect changes
	let originalEnabledIds = $state(new Set());

	let hasChanges = $derived(() => {
		const currentEnabled = new Set(destinations.filter((d) => d.isActive).map((d) => d.id));
		if (currentEnabled.size !== originalEnabledIds.size) return true;
		for (const id of currentEnabled) {
			if (!originalEnabledIds.has(id)) return true;
		}
		return false;
	});

	// Fetch destinations on mount
	$effect(() => {
		fetchDestinations();
	});

	async function fetchDestinations() {
		loading = true;
		error = '';

		try {
			const response = await fetch(`/merchant/${domain}/api/destinations`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch destinations');
			}

			destinations = result.destinations;
			hasExistingConfig = result.hasExistingConfig;

			// Store original state
			originalEnabledIds = new Set(destinations.filter((d) => d.isActive).map((d) => d.id));
		} catch (err) {
			error = err.message;
			destinations = [];
		} finally {
			loading = false;
		}
	}

	function handleToggle(destinationId) {
		destinations = destinations.map((d) =>
			d.id === destinationId && !d.isComingSoon && d.canToggle
				? { ...d, isActive: !d.isActive }
				: d
		);
		successMessage = '';
	}

	async function handleSave() {
		saving = true;
		error = '';
		successMessage = '';

		try {
			const enabledDestinations = destinations.filter((d) => d.isActive).map((d) => d.id);

			const response = await fetch(`/merchant/${domain}/api/destinations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enabledDestinations })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to save destinations');
			}

			// Update original state
			originalEnabledIds = new Set(enabledDestinations);
			hasExistingConfig = true;

			if (result.isFirstTimeSave) {
				// Redirect to dashboard after completing onboarding step
				goto(`/merchant/${domain}`, { invalidateAll: true });
				return;
			} else if (hasChanges()) {
				successMessage = 'Destinations updated successfully!';
			} else {
				successMessage = 'Configuration confirmed!';
			}
		} catch (err) {
			error = err.message;
		} finally {
			saving = false;
		}
	}
</script>

<DestinationsPage
	{domain}
	{destinations}
	{loading}
	{saving}
	{error}
	{successMessage}
	{hasExistingConfig}
	hasChanges={hasChanges()}
	onToggle={handleToggle}
	onSave={handleSave}
/>
