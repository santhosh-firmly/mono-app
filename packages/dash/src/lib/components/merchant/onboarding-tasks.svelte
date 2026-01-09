<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import BrandedProgress from './branded-progress.svelte';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import Circle from 'lucide-svelte/icons/circle';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Zap from 'lucide-svelte/icons/zap';
	import FileSignature from 'lucide-svelte/icons/file-signature';
	import Building2 from 'lucide-svelte/icons/building-2';
	import StoreIcon from 'lucide-svelte/icons/store';
	import TagIcon from 'lucide-svelte/icons/tag';
	import Shield from 'lucide-svelte/icons/shield';
	import Rocket from 'lucide-svelte/icons/rocket';
	import Lock from 'lucide-svelte/icons/lock';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import { slide } from 'svelte/transition';

	let {
		domain = '',
		initialStatuses = {
			integration: 'in-progress',
			agreement: 'pending',
			kyb: 'pending',
			destinations: 'pending',
			catalog: 'pending',
			cdn: 'pending',
			goLive: 'pending'
		},
		kybStatus = null,
		goLiveStatus = null
	} = $props();

	// Check if KYB is approved (allows access to post-KYB steps)
	let isKybApproved = $derived(initialStatuses.kyb === 'completed');

	// Check if integration is complete (required for go-live)
	let isIntegrationComplete = $derived(initialStatuses.integration === 'completed');

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
			id: 'kyb',
			title: 'Know your business',
			description:
				'Complete your company information so Firmly can verify your business for compliance.',
			completedMessage: 'Your business has been verified.',
			pendingApprovalMessage: 'Your information is being reviewed by Firmly.',
			icon: Building2,
			hrefPath: '/settings?from=onboarding'
		},
		{
			id: 'destinations',
			title: 'Configure destinations',
			description: 'Choose the destinations where you want to sell your products.',
			completedMessage: 'Destinations have been configured.',
			icon: StoreIcon,
			hrefPath: '/destinations',
			requiresKybApproval: true
		},
		{
			id: 'catalog',
			title: 'Configure product catalog',
			description:
				"Choose which products from your store you'd like to make available across AI destinations.",
			completedMessage: 'Product catalog has been configured.',
			icon: TagIcon,
			hrefPath: '/catalog',
			requiresKybApproval: true
		},
		{
			id: 'cdn',
			title: 'Complete CDN whitelisting',
			description:
				'Whitelist Firmly domains in your CDN configuration to ensure proper widget loading.',
			completedMessage: 'CDN whitelisting has been completed.',
			icon: Shield,
			hrefPath: '/settings/cdn',
			requiresKybApproval: true
		},
		{
			id: 'goLive',
			title: 'Go live approval',
			description:
				'Firmly will review your configuration and approve you to go live with destinations.',
			completedMessage:
				'Your store is live! Customers can now purchase through AI destinations.',
			pendingApprovalMessage: 'Firmly is reviewing your configuration.',
			icon: Rocket,
			showAction: false, // No action button - Firmly reviews internally
			requiresKybApproval: true,
			requiresIntegrationComplete: true
		}
	];

	// Derived tasks combining definitions with statuses, computed hrefs, and blocking
	let tasks = $derived(
		taskDefinitions.map((def) => {
			const status = initialStatuses[def.id] || 'pending';
			const blockedByKyb = def.requiresKybApproval && !isKybApproved;
			const blockedByIntegration = def.requiresIntegrationComplete && !isIntegrationComplete;
			const isBlocked = blockedByKyb || blockedByIntegration;

			// Determine blocked reason (prioritize KYB over integration)
			let blockedReason = null;
			if (blockedByKyb) {
				blockedReason = 'Pending KYB approval';
			} else if (blockedByIntegration) {
				blockedReason = 'Pending integration completion';
			}

			return {
				...def,
				status,
				href: `/merchant/${domain}${def.hrefPath}`,
				isBlocked,
				blockedReason
			};
		})
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
				<span class="text-2xl font-semibold text-foreground">{completedTasks}</span>
				<span class="text-sm text-muted-foreground">/{tasks.length}</span>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-1">
			<BrandedProgress value={progressPercentage} color="green" />
			<p class="text-xs text-muted-foreground text-right">
				{Math.round(progressPercentage)}% complete
			</p>
		</div>

		<div class="space-y-2">
			{#each tasks as task (task.id)}
				{@const isExpanded = expandedTask === task.id}
				{@const isKybPending = task.id === 'kyb' && task.status === 'in-progress'}
				{@const isKybRejected = task.id === 'kyb' && task.status === 'rejected'}
				{@const isGoLivePending = task.id === 'goLive' && task.status === 'in-progress'}
				{@const isGoLiveRejected = task.id === 'goLive' && task.status === 'rejected'}
				<div
					class={[
						'rounded-lg border transition-all duration-200',
						task.isBlocked
							? 'border-border bg-muted/50 opacity-60'
							: task.status === 'completed'
								? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50'
								: task.status === 'in-progress'
									? 'border-primary/20 bg-primary/5'
									: task.status === 'rejected'
										? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
										: 'border-border bg-card hover:border-muted-foreground/30'
					]}
				>
					<button
						onclick={() => toggleTask(task.id)}
						class="flex w-full items-center gap-3 p-3 text-left"
						disabled={task.isBlocked}
					>
						<div
							class={[
								'flex h-8 w-8 items-center justify-center rounded-full',
								task.isBlocked
									? 'bg-muted'
									: task.status === 'completed'
										? 'bg-green-100 dark:bg-green-900'
										: task.status === 'in-progress'
											? 'bg-primary/10'
											: task.status === 'rejected'
												? 'bg-red-100 dark:bg-red-900'
												: 'bg-muted'
							]}
						>
							{#if task.isBlocked}
								<Lock class="h-4 w-4 text-muted-foreground" />
							{:else}
								<task.icon
									class={[
										'h-4 w-4',
										task.status === 'completed'
											? 'text-green-600 dark:text-green-400'
											: task.status === 'in-progress'
												? 'text-primary'
												: task.status === 'rejected'
													? 'text-red-600 dark:text-red-400'
													: 'text-muted-foreground'
									]}
								/>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<p
								class={[
									'text-sm font-medium',
									task.isBlocked
										? 'text-muted-foreground'
										: task.status === 'completed'
											? 'text-green-700 dark:text-green-400'
											: task.status === 'in-progress'
												? 'text-primary'
												: task.status === 'rejected'
													? 'text-red-700 dark:text-red-400'
													: 'text-foreground'
								]}
							>
								{task.title}
							</p>
							{#if task.isBlocked}
								<p class="text-xs text-muted-foreground">{task.blockedReason}</p>
							{:else if isKybPending || isGoLivePending}
								<p
									class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
								>
									<Clock class="h-3 w-3" />
									Awaiting approval
								</p>
							{:else if isKybRejected || isGoLiveRejected}
								<p class="text-xs text-red-600 dark:text-red-400">
									Needs attention
								</p>
							{:else if task.status === 'in-progress'}
								<p class="text-xs text-primary">In progress</p>
							{:else if task.status === 'completed'}
								<p class="text-xs text-green-600 dark:text-green-400">Completed</p>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							{#if task.isBlocked}
								<Circle class="h-5 w-5 text-muted-foreground/50" />
							{:else if task.status === 'completed'}
								<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
							{:else if task.status === 'rejected'}
								<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
							{:else}
								<Circle class="h-5 w-5 text-muted-foreground/50" />
							{/if}
							{#if !task.isBlocked}
								<ChevronRight
									class={[
										'h-4 w-4 text-muted-foreground transition-transform duration-200',
										isExpanded ? 'rotate-90' : ''
									]}
								/>
							{/if}
						</div>
					</button>
					{#if isExpanded && !task.isBlocked}
						<div class="px-3 pb-3" transition:slide={{ duration: 200 }}>
							<div class="ml-11 space-y-3">
								{#if task.status === 'completed' && task.completedMessage}
									<p class="text-sm text-green-700 dark:text-green-400">
										{task.completedMessage}
									</p>
								{:else if (isKybPending || isGoLivePending) && task.pendingApprovalMessage}
									<p class="text-sm text-amber-700 dark:text-amber-400">
										{task.pendingApprovalMessage}
									</p>
								{:else if isKybRejected && kybStatus?.kyb_rejection_notes}
									<div class="space-y-2">
										<p class="text-sm text-red-700 dark:text-red-400">
											Your submission cannot be approved at this time.
										</p>
										<p class="text-sm text-muted-foreground italic">
											"{kybStatus.kyb_rejection_notes}"
										</p>
									</div>
								{:else if isGoLiveRejected && goLiveStatus?.go_live_rejection_notes}
									<div class="space-y-2">
										<p class="text-sm text-red-700 dark:text-red-400">
											Your go-live request was rejected. Please address the
											feedback and Firmly will re-review.
										</p>
										<p class="text-sm text-muted-foreground italic">
											"{goLiveStatus.go_live_rejection_notes}"
										</p>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">{task.description}</p>
								{/if}
								{#if task.status !== 'completed' && task.showAction !== false}
									<a
										href={task.href}
										class={[
											'inline-flex items-center text-sm font-medium',
											isKybRejected
												? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
												: 'text-primary hover:text-primary/80'
										]}
									>
										{#if isKybPending}
											View Submission
										{:else if isKybRejected}
											Review Submission Information
										{:else if task.status === 'in-progress'}
											Continue
										{:else}
											Start
										{/if}
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
			<div
				class="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
					>
						<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p class="text-sm font-medium text-green-800 dark:text-green-300">
							All tasks completed!
						</p>
						<p class="text-xs text-green-600 dark:text-green-400">
							Your store is ready to go live.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
