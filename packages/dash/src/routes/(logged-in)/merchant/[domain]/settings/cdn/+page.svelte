<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import ConfigurationStep from '$lib/components/merchant/configuration-step.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Server from 'lucide-svelte/icons/server';
	import Shield from 'lucide-svelte/icons/shield';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';

	let domain = $derived($page.params.domain);

	// State
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let confirmed = $state(false);
	let isCompleted = $state(false);
	let copiedSection = $state(null);

	// CDN detection simulation
	let isDetecting = $state(true);
	let detectedCDN = $state(null);

	// System IPs and user agent
	const systemIPs = ['52.18.123.45', '52.18.123.46', '52.18.123.47', '52.18.123.48'];
	const userAgent = 'FirmlyCommerce-Bot/1.0';

	// CDN configurations
	const cdnConfigs = {
		akamai: {
			name: 'Akamai',
			color: 'text-blue-600',
			steps: [
				{
					title: 'Access Akamai Control Center',
					description: `Log into your Akamai Control Center and navigate to the property configuration for ${domain}`
				},
				{
					title: 'Configure IP Whitelist',
					description: 'Add our system IPs to the allowed list:',
					code: systemIPs.join('\n'),
					copyId: 'akamai-ips'
				},
				{
					title: 'Update Bot Manager Rules',
					description: 'In Bot Manager, create a new rule to allow our user agent:',
					code: `User-Agent: ${userAgent}\nAction: Allow\nBypass: All security checks`,
					copyId: 'akamai-bot'
				},
				{
					title: 'Configure Rate Limiting',
					description: 'Update rate limiting rules to exclude our IPs:',
					code: `Rule: Whitelist Product Sync\nSource IPs: ${systemIPs.join(', ')}\nRate Limit: Exempt\nPath: /products*, /collections*, /cart*`,
					copyId: 'akamai-rate'
				},
				{
					title: 'Deploy Changes',
					description:
						'Activate your configuration changes to the production network. Changes typically propagate within 5-10 minutes.'
				}
			]
		},
		cloudflare: {
			name: 'Cloudflare',
			color: 'text-orange-600',
			steps: [
				{
					title: 'Access Cloudflare Dashboard',
					description: `Log into Cloudflare and select ${domain} from your account`
				},
				{
					title: 'Create IP Access Rule',
					description: 'Navigate to Security > WAF > Tools > IP Access Rules and add:',
					code: systemIPs
						.map((ip) => `${ip} - Action: Allow - Note: Firmly Commerce Bot`)
						.join('\n'),
					copyId: 'cloudflare-ips'
				},
				{
					title: 'Configure User Agent Rules',
					description: 'Go to Security > WAF > Custom Rules and create a new rule:',
					code: `Rule Name: Allow Firmly Commerce\nField: User Agent\nOperator: equals\nValue: ${userAgent}\nAction: Skip > All remaining custom rules, Bot Fight Mode, Rate Limiting`,
					copyId: 'cloudflare-agent'
				},
				{
					title: 'Update Rate Limiting',
					description: 'In Security > WAF > Rate limiting rules, add exception:',
					code: `Rule: Exempt Firmly Commerce\nWhen incoming requests match:\n  (http.user_agent eq "${userAgent}" or ip.src in {${systemIPs.join(' ')}})\nThen: bypass rate limiting`,
					copyId: 'cloudflare-rate'
				},
				{
					title: 'Verify Bot Management',
					description:
						'Ensure Super Bot Fight Mode or Bot Management allows our traffic. Add our user agent to the allowlist if using these features.'
				}
			]
		},
		fastly: {
			name: 'Fastly',
			color: 'text-red-600',
			steps: [
				{
					title: 'Access Fastly Control Panel',
					description: `Log into Fastly and select the service configuration for ${domain}`
				},
				{
					title: 'Create IP ACL',
					description:
						"Navigate to Configure > ACLs and create a new ACL named 'firmly_commerce_ips':",
					code: systemIPs.map((ip) => `${ip}/32`).join('\n'),
					copyId: 'fastly-ips'
				},
				{
					title: 'Update VCL Configuration',
					description: 'Add custom VCL snippet in vcl_recv subroutine:',
					code: `# Allow Firmly Commerce Bot\nif (req.http.User-Agent ~ "${userAgent}" || client.ip ~ firmly_commerce_ips) {\n  return(pass);\n}`,
					copyId: 'fastly-vcl'
				},
				{
					title: 'Configure Rate Limiting',
					description: 'In Rate Limiting settings, add exception rule:',
					code: `Name: Firmly Commerce Exempt\nCondition: req.http.User-Agent ~ "${userAgent}"\nAction: Exempt from rate limiting`,
					copyId: 'fastly-rate'
				},
				{
					title: 'Activate Configuration',
					description:
						'Clone your configuration, make changes, and activate the new version. Changes are typically live within 1-2 minutes.'
				}
			]
		},
		other: {
			name: 'Custom CDN/WAF',
			color: 'text-muted-foreground',
			steps: [
				{
					title: 'Identify Your Security Layers',
					description: `Determine all security systems protecting ${domain} (WAF, rate limiting, bot detection, DDoS protection)`
				},
				{
					title: 'Whitelist System IPs',
					description: 'Add these IP addresses to your CDN/WAF allowlist:',
					code: systemIPs.join('\n'),
					copyId: 'other-ips'
				},
				{
					title: 'Allow User Agent',
					description: 'Configure your system to allow requests with this user agent:',
					code: userAgent,
					copyId: 'other-agent'
				},
				{
					title: 'Exempt from Rate Limiting',
					description:
						'Configure rate limiting rules to exempt our IPs and user agent for these paths:',
					code: `/products/*\n/collections/*\n/cart/*\n/checkout/*\n/api/*`,
					copyId: 'other-paths'
				},
				{
					title: 'Test Configuration',
					description:
						'After making changes, our system will automatically verify connectivity. Contact support if you need assistance with custom configurations.'
				}
			]
		}
	};

	let currentConfig = $derived(detectedCDN ? cdnConfigs[detectedCDN] : null);

	// Fetch current status
	async function fetchStatus() {
		loading = true;
		error = '';

		try {
			const response = await fetch(`/merchant/${domain}/settings/cdn/api`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch status');
			}

			isCompleted = result.completed || false;
			confirmed = result.completed || false;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// Simulate CDN detection
	function detectCDN() {
		isDetecting = true;
		setTimeout(() => {
			// For demo, randomly assign or default to cloudflare
			const cdns = ['akamai', 'cloudflare', 'fastly', 'other'];
			detectedCDN = cdns[Math.floor(Math.random() * cdns.length)];
			isDetecting = false;
		}, 1500);
	}

	// Complete setup
	async function completeSetup() {
		if (!confirmed) return;

		saving = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/merchant/${domain}/settings/cdn/api`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completed: true })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to save');
			}

			isCompleted = true;

			if (result.isFirstTimeSave) {
				// Redirect to dashboard to see onboarding tasks list
				goto(`/merchant/${domain}`, { invalidateAll: true });
				return;
			}

			successMessage = 'CDN whitelisting status updated!';
		} catch (err) {
			error = err.message;
		} finally {
			saving = false;
		}
	}

	// Copy to clipboard
	function handleCopy(text, section) {
		navigator.clipboard.writeText(text);
		copiedSection = section;
		setTimeout(() => (copiedSection = null), 2000);
	}

	// Initial fetch and CDN detection
	$effect(() => {
		fetchStatus();
		detectCDN();
	});
</script>

<div class="space-y-6">
	<MerchantPageHeader
		title="CDN & Security Whitelisting"
		description="Configure your CDN to allow our system to access product data from {domain}"
	/>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else}
		<!-- Completion banner when already completed -->
		{#if isCompleted}
			<Card.Root
				class="border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30"
			>
				<Card.Content class="py-6">
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50"
						>
							<CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 class="text-lg font-semibold text-green-800 dark:text-green-300">
								CDN Whitelisting Complete
							</h3>
							<p class="text-sm text-green-700 dark:text-green-400">
								Your CDN has been configured to allow Firmly's product sync system.
							</p>
						</div>
					</div>
					{#if successMessage}
						<div
							class="mt-4 p-3 bg-white/50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg"
						>
							<p class="text-sm text-green-700 dark:text-green-400">
								{successMessage}
							</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}
		<Card.Root>
			<Card.Header>
				<Card.Title>Configuration Guide</Card.Title>
				<Card.Description>
					Follow these steps to whitelist our system and prevent blocking or rate
					limiting.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				{#if isDetecting}
					<div class="text-center py-8">
						<Loader2 class="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
						<p class="text-muted-foreground">Detecting your CDN configuration...</p>
					</div>
				{:else if currentConfig}
					<!-- CDN Detection Result -->
					<div
						class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg"
					>
						<Server class="h-5 w-5 text-blue-600 dark:text-blue-400" />
						<p class="text-sm text-blue-800 dark:text-blue-300">
							We detected that <strong>{domain}</strong> is using
							<Badge variant="outline" class="ml-1">{currentConfig.name}</Badge>
						</p>
					</div>

					<!-- Configuration Header -->
					<div
						class="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-lg"
					>
						<Shield class={['h-6 w-6', currentConfig.color]} />
						<div>
							<h4 class="font-medium text-foreground">
								{currentConfig.name} Configuration Guide
							</h4>
							<p class="text-sm text-muted-foreground">
								Follow these steps to whitelist our system and prevent blocking or
								rate limiting.
							</p>
						</div>
					</div>

					<!-- Steps -->
					<div class="space-y-4">
						{#each currentConfig.steps as step, index (step.title)}
							<ConfigurationStep {step} {index} {copiedSection} onCopy={handleCopy} />
						{/each}
					</div>

					<!-- Important Notes -->
					<div
						class="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4"
					>
						<h4
							class="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2"
						>
							<AlertTriangle class="h-4 w-4" />
							Important Notes
						</h4>
						<ul
							class="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside"
						>
							<li>Changes may take 5-15 minutes to propagate across CDN edges</li>
							<li>
								Keep your existing security rules - only add exceptions for our
								system
							</li>
							<li>
								Our system will automatically verify connectivity after you confirm
							</li>
							<li>Contact support if you encounter any issues during setup</li>
						</ul>
					</div>

					{#if error}
						<div
							class="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
						>
							<p class="text-sm text-red-700 dark:text-red-400">{error}</p>
						</div>
					{/if}

					<!-- Confirmation (only show if not already completed) -->
					{#if !isCompleted}
						<div class="flex items-start gap-3 p-4 border border-border rounded-lg">
							<Checkbox id="confirm" bind:checked={confirmed} class="mt-0.5" />
							<label for="confirm" class="text-sm cursor-pointer">
								I have completed the whitelisting configuration in my {currentConfig.name}
								settings and understand that it may take a few minutes for changes to
								propagate.
							</label>
						</div>
					{/if}
				{/if}
			</Card.Content>
			{#if !isDetecting && currentConfig && !isCompleted}
				<Card.Footer class="flex justify-end border-t px-6 py-4">
					<Button onclick={completeSetup} disabled={saving || !confirmed} size="lg">
						{#if saving}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Completing...
						{:else}
							<CheckCircle class="mr-2 h-5 w-5" />
							Complete Setup
						{/if}
					</Button>
				</Card.Footer>
			{/if}
		</Card.Root>
	{/if}
</div>
