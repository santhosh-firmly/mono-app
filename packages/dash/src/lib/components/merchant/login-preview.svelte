<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedBackground from './animated-background.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	let currentBg = $state('starry-night');
	let currentLayout = $state('full');
	let glowEnabled = $state(false);

	const bgOptions = [
		{ id: 'starry-night', name: 'Starry Night' },
		{ id: 'sliding-diagonals', name: 'Sliding Diagonals' },
		{ id: 'rainbow-lines', name: 'Rainbow Lines' },
		{ id: 'rainbow-gradient', name: 'Rainbow Gradient' },
		{ id: 'modern-gradient', name: 'Modern Gradient' },
		{ id: 'bokeh-dots', name: 'Bokeh Dots' }
	];

	const layoutOptions = [
		{ id: 'full', name: 'Full Screen' },
		{ id: 'split', name: 'Split Vertical' },
		{ id: 'diagonal', name: 'Diagonal Cut' }
	];
</script>

<!-- Selectors -->
<div class="fixed top-4 right-4 z-50 flex flex-col gap-3 items-end">
	<!-- Layout selector -->
	<div class="flex gap-2">
		{#each layoutOptions as layout (layout.id)}
			<button
				onclick={() => (currentLayout = layout.id)}
				class="px-3 py-1.5 text-xs font-medium rounded-full transition-all {currentLayout ===
				layout.id
					? 'bg-primary text-primary-foreground shadow-lg'
					: 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'}"
			>
				{layout.name}
			</button>
		{/each}
		<!-- Glow toggle -->
		<button
			onclick={() => (glowEnabled = !glowEnabled)}
			class="px-3 py-1.5 text-xs font-medium rounded-full transition-all {glowEnabled
				? 'bg-gradient-to-r from-pink-500 to-primary text-white shadow-lg'
				: 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'}"
		>
			Glow {glowEnabled ? 'On' : 'Off'}
		</button>
	</div>
	<!-- Background selector -->
	<div class="flex gap-2 flex-wrap max-w-md justify-end">
		{#each bgOptions as bg (bg.id)}
			<button
				onclick={() => (currentBg = bg.id)}
				class="px-3 py-1.5 text-xs font-medium rounded-full transition-all {currentBg ===
				bg.id
					? 'bg-white text-gray-900 shadow-lg'
					: 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}"
			>
				{bg.name}
			</button>
		{/each}
	</div>
</div>

<AnimatedBackground background={currentBg} layout={currentLayout} />

<!-- Login Card -->
<div class="card-container layout-{currentLayout}">
	<div class="w-full max-w-md {glowEnabled ? 'glow-box' : ''}">
		<Card.Root class="w-full shadow-2xl" style="background-color: white;">
			<Card.Header>
				<FirmlyLogo class="pb-6" />
				<Card.Title class="text-2xl">Merchant Login</Card.Title>
				<Card.Description>Enter your email to receive a login link</Card.Description>
			</Card.Header>
			<Card.Content>
				<form class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input id="email" type="email" placeholder="you@example.com" />
					</div>
					<button
						type="button"
						class="primary-btn w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200"
					>
						Send Login Link
					</button>
				</form>
			</Card.Content>
			<Card.Footer class="flex flex-col gap-4">
				<div class="text-center text-sm text-muted-foreground">
					Don't have an account?
					<a
						href="/signup/verify-domain"
						class="font-medium underline-offset-4 hover:underline"
						style="color: #7979ff;"
					>
						Sign up
					</a>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>
</div>

<style>
	/* Glow Effect */
	.glow-box {
		position: relative;
		border-radius: 8px;
	}

	.glow-box::after {
		position: absolute;
		content: '';
		top: 5px;
		left: 0;
		right: 0;
		z-index: -1;
		height: 100%;
		width: 100%;
		transform: scale(0.9) translateZ(0);
		filter: blur(15px);
		background: linear-gradient(
			to left,
			#ff5770,
			#e4428d,
			#c42da8,
			#9e16c3,
			#6501de,
			#9e16c3,
			#c42da8,
			#e4428d,
			#ff5770
		);
		background-size: 200% 200%;
		animation: animateGlow 1.25s linear infinite;
	}

	@keyframes animateGlow {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 200% 50%;
		}
	}

	/* Primary Button */
	.primary-btn {
		background-color: #7979ff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.primary-btn:hover {
		background-color: #ffbf00;
		color: #1a1a1a;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	/* Card container base styles */
	.card-container {
		position: relative;
		z-index: 10;
		display: flex;
		min-height: 100vh;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	/* Full screen layout (default) */
	.card-container.layout-full {
		justify-content: center;
	}

	/* Split vertical layout */
	.card-container.layout-split {
		justify-content: flex-end;
		padding-right: 12.5%;
	}

	/* Diagonal cut layout */
	.card-container.layout-diagonal {
		justify-content: center;
	}
</style>
