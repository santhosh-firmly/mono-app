<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import PanelToggle from './panel-toggle.svelte';

	/**
	 * @typedef {Object} RequestListProps
	 * @property {Array} [requests] - List of intercepted requests
	 * @property {number} [defaultDelay] - Auto-accept delay in ms
	 * @property {boolean} [autoAccept] - Enable auto-accept mode
	 * @property {Function} [onAccept] - Accept request handler
	 * @property {Function} [onReject] - Reject request handler
	 * @property {Function} [onDelayChange] - Delay setting handler
	 * @property {Function} [onAutoAcceptChange] - Auto-accept toggle handler
	 * @property {Function} [onClear] - Clear history handler
	 */

	/** @type {RequestListProps} */
	let {
		requests = [],
		defaultDelay = 5000,
		autoAccept = true,
		onAccept = () => {},
		onReject = () => {},
		onDelayChange = () => {},
		onAutoAcceptChange = () => {},
		onClear = () => {}
	} = $props();

	function getMethodColor(method) {
		const colors = {
			GET: 'bg-blue-100 text-blue-700',
			POST: 'bg-green-100 text-green-700',
			PUT: 'bg-amber-100 text-amber-700',
			DELETE: 'bg-red-100 text-red-700',
			PATCH: 'bg-purple-100 text-purple-700'
		};
		return colors[method] || 'bg-gray-100 text-gray-700';
	}

	function getStatusIcon(status) {
		if (status === 'accepted') return 'mdi:check-bold';
		if (status === 'rejected') return 'mdi:close';
		return null;
	}

	function getStatusColor(status) {
		if (status === 'accepted') return 'text-green-600';
		if (status === 'rejected') return 'text-red-600';
		return 'text-gray-400';
	}

	let hasCompletedRequests = $derived(requests.some((r) => r.status !== 'pending'));

	const delayOptions = [
		{ label: 'Short', value: 1000 },
		{ label: 'Medium', value: 3000 },
		{ label: 'Large', value: 5000 }
	];
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
		<div class="flex flex-col gap-2">
			<span class="text-xs font-medium text-gray-600">Response delay</span>
			<div class="flex items-center rounded-md border border-gray-200 bg-white p-0.5">
				{#each delayOptions as option (option.value)}
					<button
						type="button"
						onclick={() => onDelayChange(option.value)}
						class={[
							'flex h-6 flex-1 items-center justify-center rounded text-xs font-medium transition-colors',
							defaultDelay === option.value
								? 'bg-black text-white'
								: 'text-gray-400 hover:text-gray-600'
						]}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium text-gray-600">Auto-accept requests</span>
			<PanelToggle checked={autoAccept} onchange={onAutoAcceptChange} />
		</div>
	</div>

	<div class="flex flex-col gap-2">
		{#if requests.length === 0}
			<div class="flex flex-col items-center justify-center py-8 text-gray-400">
				<Icon icon="mdi:swap-horizontal" class="mb-2 text-2xl" />
				<p class="text-xs">No requests yet</p>
			</div>
		{:else}
			{#if hasCompletedRequests}
				<div class="flex justify-end">
					<button
						type="button"
						onclick={onClear}
						class="text-xs text-gray-400 transition-colors hover:text-gray-600"
					>
						Clear history
					</button>
				</div>
			{/if}

			{#each requests as request (request.id)}
				<div
					class={[
						'group flex items-start gap-3 rounded-lg border p-3 transition-all',
						request.status === 'pending'
							? 'border-gray-200 bg-white'
							: request.status === 'accepted'
								? 'border-gray-100 bg-gray-50'
								: 'border-red-100 bg-red-50/50'
					]}
				>
					<div class="flex flex-col items-center gap-1">
						<span
							class={[
								'rounded px-1.5 py-0.5 text-[10px] font-medium',
								getMethodColor(request.method)
							]}
						>
							{request.method}
						</span>
						{#if request.status !== 'pending'}
							<Icon
								icon={getStatusIcon(request.status)}
								class={['text-sm', getStatusColor(request.status)]}
							/>
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between gap-2">
							<span class="truncate text-sm font-medium text-gray-900">
								{request.type}
							</span>
							{#if request.status === 'pending' && autoAccept}
								<span class="shrink-0 text-xs text-gray-400 tabular-nums">
									{(request.remainingTime / 1000).toFixed(1)}s
								</span>
							{:else if request.duration}
								<span class="shrink-0 text-xs text-gray-400">
									{request.duration}
								</span>
							{/if}
						</div>

						{#if request.url}
							<p class="mt-0.5 truncate text-xs text-gray-500" title={request.url}>
								{request.url}
							</p>
						{/if}

						{#if request.status === 'pending'}
							<div class="mt-2 flex items-center gap-2">
								{#if autoAccept}
									<div
										class="h-1 flex-1 overflow-hidden rounded-full bg-gray-100"
									>
										<div
											class="h-full bg-gray-900 transition-all duration-100"
											style="width: {(request.remainingTime / defaultDelay) *
												100}%"
										></div>
									</div>
								{/if}
								<div class="flex shrink-0 gap-1">
									<button
										type="button"
										onclick={() => onAccept(request.id)}
										class="rounded p-1 text-gray-400 transition-colors hover:bg-green-100 hover:text-green-600"
										title="Accept"
									>
										<Icon icon="mdi:check-bold" class="text-sm" />
									</button>
									<button
										type="button"
										onclick={() => onReject(request.id)}
										class="rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
										title="Reject"
									>
										<Icon icon="mdi:close" class="text-sm" />
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
