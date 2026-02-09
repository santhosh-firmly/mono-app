<script>
	import {
		ChevronDown,
		ChevronRight,
		CheckCircle2,
		XCircle,
		AlertTriangle,
		Clock
	} from 'lucide-svelte';

	let { testRun = null, isTestStale = false } = $props();

	let expandedSuites = $state({});

	const groupedResults = $derived.by(() => {
		if (!testRun?.results?.length) return {};
		const groups = {};
		for (const result of testRun.results) {
			if (!groups[result.suite]) groups[result.suite] = [];
			groups[result.suite].push(result);
		}
		return groups;
	});

	function toggleSuite(suite) {
		expandedSuites = { ...expandedSuites, [suite]: !expandedSuites[suite] };
	}
</script>

<div class="flex h-full flex-col overflow-hidden bg-background">
	{#if !testRun}
		<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
			No tests have been run yet. Click "Run Tests" to start.
		</div>
	{:else if testRun.status === 'running'}
		<div class="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
			<Clock class="h-4 w-4 animate-spin" />
			Running tests...
		</div>
	{:else}
		<div class="flex items-center gap-3 border-b px-3 py-2">
			<div class="flex items-center gap-1.5 text-sm font-medium">
				{#if testRun.status === 'passed'}
					<CheckCircle2 class="h-4 w-4 text-green-500" />
					<span class="text-green-600">All tests passed</span>
				{:else}
					<XCircle class="h-4 w-4 text-red-500" />
					<span class="text-red-600">{testRun.summary.failed} failed</span>
				{/if}
			</div>
			<span class="text-xs text-muted-foreground">
				{testRun.summary.passed}/{testRun.summary.total} passed · {testRun.summary
					.duration}ms
			</span>
			{#if isTestStale}
				<span
					class="ml-auto flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
				>
					<AlertTriangle class="h-3 w-3" />
					Results may be outdated
				</span>
			{/if}
		</div>
		<div class="flex-1 overflow-y-auto">
			{#each Object.entries(groupedResults) as [suite, results] (suite)}
				{@const failedCount = results.filter((r) => r.status === 'failed').length}
				<div class="border-b last:border-b-0">
					<button
						class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50"
						onclick={() => toggleSuite(suite)}
					>
						{#if expandedSuites[suite]}
							<ChevronDown class="h-3.5 w-3.5 text-muted-foreground" />
						{:else}
							<ChevronRight class="h-3.5 w-3.5 text-muted-foreground" />
						{/if}
						<span class="font-medium">{suite}</span>
						{#if failedCount > 0}
							<span class="text-xs text-red-500">{failedCount} failed</span>
						{:else}
							<span class="text-xs text-green-500">all passed</span>
						{/if}
					</button>
					{#if expandedSuites[suite]}
						<div class="pb-1">
							{#each results as result (result.testName)}
								<div class="flex items-start gap-2 px-3 py-1 pl-8">
									{#if result.status === 'passed'}
										<CheckCircle2
											class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500"
										/>
									{:else}
										<XCircle
											class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500"
										/>
									{/if}
									<div class="min-w-0 flex-1">
										<span
											class="text-xs {result.status === 'failed'
												? 'text-red-600'
												: 'text-muted-foreground'}">{result.testName}</span
										>
										<span class="ml-2 text-xs text-muted-foreground/60"
											>{result.duration}ms</span
										>
										{#if result.status === 'failed' && result.errorMessage}
											<div
												class="mt-1 rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400"
											>
												{result.errorMessage}
												{#if result.filePath}
													<span class="ml-1 text-muted-foreground"
														>({result.filePath}{result.lineNumber
															? `:${result.lineNumber}`
															: ''})</span
													>
												{/if}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
