<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';

	/**
	 * @type {{
	 *   domain?: string,
	 *   isSigned?: boolean,
	 *   signedInfo?: { signed_by_email?: string, signed_at?: string, client_location?: string } | null,
	 *   isSubmitting?: boolean,
	 *   onaccept?: () => void
	 * }}
	 */
	let {
		domain = '',
		isSigned = false,
		signedInfo = null,
		isSubmitting = false,
		onaccept
	} = $props();

	let hasReadAgreement = $state(false);
	let acceptedTerms = $state(false);

	let canProceed = $derived(hasReadAgreement && acceptedTerms);

	function handleScroll(e) {
		const element = e.currentTarget;
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 10;
		if (isAtBottom && !hasReadAgreement) {
			hasReadAgreement = true;
		}
	}

	function formatDate(dateStr) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Card.Root class="w-full max-w-4xl mx-auto">
	<Card.Header>
		<Card.Title class="text-xl">Merchant Agreement</Card.Title>
		<Card.Description>
			{#if isSigned}
				This agreement was signed and is in effect
			{:else}
				Please review and accept the terms to start selling on multiple AI-powered
				destinations
			{/if}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		{#if isSigned && signedInfo}
			<div
				class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-4"
			>
				<div class="flex items-start gap-3">
					<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
					<div class="space-y-1">
						<p class="text-sm font-medium text-green-800 dark:text-green-300">
							Agreement Signed
						</p>
						<p class="text-sm text-green-700 dark:text-green-400">
							Signed by <span class="font-medium">{signedInfo.signed_by_email}</span>
						</p>
						<p class="text-sm text-green-600 dark:text-green-500">
							{formatDate(signedInfo.signed_at)}
							{#if signedInfo.client_location}
								from {signedInfo.client_location}
							{/if}
						</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="border border-border rounded-lg overflow-hidden">
			<div class="h-96 overflow-y-auto p-6" onscroll={handleScroll}>
				<div class="space-y-4 text-sm">
					<h3 class="text-lg font-semibold text-foreground">
						Multi-Destination Merchant Agreement
					</h3>
					<p class="text-muted-foreground">Effective Date: December 26, 2025</p>

					<div class="space-y-4">
						<div>
							<h4 class="font-medium text-foreground">1. Agreement to Terms</h4>
							<p class="text-muted-foreground mt-1">
								This Merchant Agreement ("Agreement") is entered into between {domain ||
									'[Merchant]'} ("Merchant") and our platform ("Platform"). By accepting
								this agreement, Merchant agrees to sell products across multiple AI-powered
								destinations and traditional commerce platforms.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">2. Service Description</h4>
							<p class="text-muted-foreground mt-1">
								Platform will integrate Merchant's product catalog with various AI
								agents and commerce destinations including but not limited to:
								ChatGPT, Perplexity, Gemini, Co-Pilot, Samsung AI, USA Today, Conde
								Nest, Lush Life, Klarna, and PayPal AI. Platform will handle product
								synchronization, inventory management, order routing, and payment
								processing across all enabled destinations.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">3. Commission Structure</h4>
							<p class="text-muted-foreground mt-1">
								Platform charges a commission of 8% per transaction across all
								destinations. This commission covers payment processing, fraud
								protection, order management, customer support, and integration
								maintenance. Commission is automatically deducted from each
								transaction before settlement to Merchant.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">
								4. Product Catalog & Inventory
							</h4>
							<p class="text-muted-foreground mt-1">
								Merchant grants Platform permission to access and synchronize
								product information, pricing, inventory levels, and product images
								from Merchant's website. Merchant is responsible for maintaining
								accurate inventory levels and product information. Platform will
								sync inventory in real-time to prevent overselling.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">5. Order Fulfillment</h4>
							<p class="text-muted-foreground mt-1">
								Merchant agrees to fulfill all orders received through Platform
								destinations within the timeframes specified in product listings.
								Merchant is responsible for shipping, handling, and delivery of all
								products. Platform will provide consolidated order management
								dashboard for tracking orders across all destinations.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">6. Payment & Settlement</h4>
							<p class="text-muted-foreground mt-1">
								Platform will collect payments from customers and remit funds to
								Merchant on a weekly basis, minus applicable commissions and fees.
								Settlement will occur every Friday for the previous week's orders
								(Monday-Sunday). Refunds and chargebacks will be deducted from
								future settlements.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">7. Data & Privacy</h4>
							<p class="text-muted-foreground mt-1">
								Platform will handle customer data in accordance with applicable
								privacy laws including GDPR, CCPA, and other regional regulations.
								Customer data will be shared only as necessary to fulfill orders.
								Merchant agrees to Platform's privacy policy and data processing
								agreement.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">8. Dispute Resolution</h4>
							<p class="text-muted-foreground mt-1">
								Platform provides dispute resolution services for customer
								complaints, chargebacks, and return requests. Merchant agrees to
								respond to disputes within 48 hours. Merchants maintaining dispute
								rates below 2% receive priority support and reduced commission rates
								on select destinations.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">
								9. Reputation & Quality Standards
							</h4>
							<p class="text-muted-foreground mt-1">
								Merchant must maintain minimum quality standards across all
								destinations. Products must be accurately described, properly
								priced, and delivered as promised. Platform reserves the right to
								suspend or terminate destinations with consistently poor performance
								(reputation score below 4.0 or dispute rate above 3%).
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">10. Intellectual Property</h4>
							<p class="text-muted-foreground mt-1">
								Merchant retains all rights to product names, images, descriptions,
								and branding. Merchant grants Platform a non-exclusive license to
								use this intellectual property solely for the purpose of marketing
								and selling Merchant's products across enabled destinations.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">11. Termination</h4>
							<p class="text-muted-foreground mt-1">
								Either party may terminate this Agreement with 30 days written
								notice. Upon termination, Platform will cease selling Merchant's
								products and will settle all pending transactions. Merchant remains
								responsible for fulfilling any orders placed before termination
								date.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">12. Limitation of Liability</h4>
							<p class="text-muted-foreground mt-1">
								Platform's liability is limited to the commission fees paid by
								Merchant in the preceding 12 months. Platform is not liable for lost
								profits, indirect damages, or consequential damages arising from use
								of the service.
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">13. Technical Integration</h4>
							<p class="text-muted-foreground mt-1">
								Merchant agrees to whitelist Platform's systems in their CDN and bot
								detection services to enable proper product synchronization and
								inventory updates. Platform will provide specific technical guidance
								based on Merchant's infrastructure (Akamai, Cloudflare, Fastly, or
								others).
							</p>
						</div>

						<div>
							<h4 class="font-medium text-foreground">14. Modifications</h4>
							<p class="text-muted-foreground mt-1">
								Platform may update this Agreement with 30 days notice. Continued
								use of the service after modifications constitutes acceptance of
								updated terms.
							</p>
						</div>
					</div>
				</div>
			</div>
			{#if !isSigned && !hasReadAgreement}
				<div
					class="bg-yellow-50 dark:bg-yellow-950/30 border-t border-yellow-200 dark:border-yellow-900/50 p-3 flex items-center gap-2"
				>
					<AlertCircle class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
					<span class="text-sm text-yellow-700 dark:text-yellow-400"
						>Please scroll to the bottom to continue</span
					>
				</div>
			{/if}
		</div>

		{#if !isSigned}
			<div class="space-y-4 pt-4">
				<div class="flex items-start gap-3">
					<Checkbox
						id="terms"
						checked={acceptedTerms}
						onCheckedChange={(checked) => (acceptedTerms = checked)}
						disabled={!hasReadAgreement}
					/>
					<label
						for="terms"
						class="text-sm leading-relaxed {!hasReadAgreement
							? 'text-muted-foreground/50'
							: 'text-foreground cursor-pointer'}"
					>
						I have read and agree to the Merchant Agreement terms and conditions
					</label>
				</div>
			</div>

			<div class="flex justify-end pt-4 border-t border-border">
				<Button onclick={onaccept} disabled={!canProceed || isSubmitting} size="lg">
					{isSubmitting ? 'Signing...' : 'Accept Agreement & Continue'}
				</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
