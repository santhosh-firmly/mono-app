<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import BrandedProgress from './branded-progress.svelte';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import Circle from 'lucide-svelte/icons/circle';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Zap from 'lucide-svelte/icons/zap';
	import FileSignature from 'lucide-svelte/icons/file-signature';
	import StoreIcon from 'lucide-svelte/icons/store';
	import TagIcon from 'lucide-svelte/icons/tag';
	import Shield from 'lucide-svelte/icons/shield';
	import { slide } from 'svelte/transition';

	let {
		domain = '',
		initialStatuses = {
			integration: 'in-progress',
			agreement: 'pending',
			destinations: 'pending',
			catalog: 'pending',
			cdn: 'pending'
		}
	} = $props();

	// Task definitions without hrefs (those are computed)
	const taskDefinitions = [
		{
			id: 'integration',
			title: 'Complete integration',
			description:
				'Firmly agents are integrating with your website right now. This may take a while. We will notify you when it is ready.',
			completedMessage: 'Integration has been completed successfully.',
			icon: Zap,
			hrefPath: '/settings/integration',
			showAction: false // Integration is done by Firmly, not the merchant
		},
		{
			id: 'agreement',
			title: 'Sign merchant agreement',
			description:
				'Review and sign the merchant agreement to finalize your partnership with Firmly.',
			completedMessage: 'Merchant agreement has been successfully reviewed and signed.',
			icon: FileSignature,
			hrefPath: '/agreement'
		},
		{
			id: 'destinations',
			title: 'Configure destinations',
			description: 'Choose the destinations where you want to sell your products.',
			completedMessage: 'Destinations have been configured.',
			icon: StoreIcon,
			hrefPath: '/destinations'
		},
		{
			id: 'catalog',
			title: 'Configure product catalog',
			description:
				"Choose which products from your store you'd like to make available across AI destinations.",
			completedMessage: 'Product catalog has been configured.',
			icon: TagIcon,
			hrefPath: '/catalog'
		},
		{
			id: 'cdn',
			title: 'Complete CDN whitelisting',
			description:
				'Whitelist Firmly domains in your CDN configuration to ensure proper widget loading.',
			completedMessage: 'CDN whitelisting has been completed.',
			icon: Shield,
			hrefPath: '/settings/cdn'
		}
	];

	// Derived tasks combining definitions with statuses and computed hrefs
	let tasks = $derived(
		taskDefinitions.map((def) => ({
			...def,
			status: initialStatuses[def.id] || 'pending',
			href: `/merchant/${domain}${def.hrefPath}`
		}))
	);

	let completedTasks = $derived(tasks.filter((task) => task.status === 'completed').length);
	let progressPercentage = $derived((completedTasks / tasks.length) * 100);

	let expandedTask = $state(null);

	function toggleTask(taskId) {
		expandedTask = expandedTask === taskId ? null : taskId;
	}
</script>

<Card.Root class="w-full">
	<Card.Header class="pb-3">
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="text-lg">Get started with Firmly</Card.Title>
				<Card.Description class="text-sm">
					Complete these tasks to launch your store
				</Card.Description>
			</div>
			<div class="text-right">
				<span class="text-2xl font-semibold text-gray-900">{completedTasks}</span>
				<span class="text-sm text-gray-500">/{tasks.length}</span>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-1">
			<BrandedProgress value={progressPercentage} color="green" />
			<p class="text-xs text-gray-500 text-right">
				{Math.round(progressPercentage)}% complete
			</p>
		</div>

		<div class="space-y-2">
			{#each tasks as task (task.id)}
				{@const isExpanded = expandedTask === task.id}
				<div
					class={[
						'rounded-lg border transition-all duration-200',
						task.status === 'completed'
							? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50'
							: task.status === 'in-progress'
								? 'border-primary/20 bg-primary/5'
								: 'border-border bg-card hover:border-muted-foreground/30'
					]}
				>
					<button
						onclick={() => toggleTask(task.id)}
						class="flex w-full items-center gap-3 p-3 text-left"
					>
						<div
							class={[
								'flex h-8 w-8 items-center justify-center rounded-full',
								task.status === 'completed'
									? 'bg-green-100 dark:bg-green-900'
									: task.status === 'in-progress'
										? 'bg-primary/10'
										: 'bg-muted'
							]}
						>
							<task.icon
								class={[
									'h-4 w-4',
									task.status === 'completed'
										? 'text-green-600 dark:text-green-400'
										: task.status === 'in-progress'
											? 'text-primary'
											: 'text-muted-foreground'
								]}
							/>
						</div>
						<div class="flex-1 min-w-0">
							<p
								class={[
									'text-sm font-medium',
									task.status === 'completed'
										? 'text-green-700 dark:text-green-400'
										: task.status === 'in-progress'
											? 'text-primary'
											: 'text-foreground'
								]}
							>
								{task.title}
							</p>
							{#if task.status === 'in-progress'}
								<p class="text-xs text-primary">In progress</p>
							{:else if task.status === 'completed'}
								<p class="text-xs text-green-600">Completed</p>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							{#if task.status === 'completed'}
								<CheckCircle class="h-5 w-5 text-green-600" />
							{:else}
								<Circle class="h-5 w-5 text-gray-300" />
							{/if}
							<ChevronRight
								class={[
									'h-4 w-4 text-gray-400 transition-transform duration-200',
									isExpanded ? 'rotate-90' : ''
								]}
							/>
						</div>
					</button>
					{#if isExpanded}
						<div class="px-3 pb-3" transition:slide={{ duration: 200 }}>
							<div class="ml-11 space-y-3">
								{#if task.status === 'completed' && task.completedMessage}
									<p class="text-sm text-green-700">{task.completedMessage}</p>
								{:else}
									<p class="text-sm text-gray-600">{task.description}</p>
								{/if}
								{#if task.status !== 'completed' && task.showAction !== false}
									<a
										href={task.href}
										class="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
									>
										{task.status === 'in-progress' ? 'Continue' : 'Start'}
										<ChevronRight class="ml-1 h-4 w-4" />
									</a>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		{#if completedTasks === tasks.length}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"
					>
						<CheckCircle class="h-5 w-5 text-green-600" />
					</div>
					<div>
						<p class="text-sm font-medium text-green-800">All tasks completed!</p>
						<p class="text-xs text-green-600">Your store is ready to go live.</p>
					</div>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
