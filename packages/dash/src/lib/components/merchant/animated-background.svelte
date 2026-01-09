<script>
	/**
	 * @typedef {'starry-night' | 'sliding-diagonals' | 'rainbow-lines' | 'rainbow-gradient' | 'modern-gradient' | 'bokeh-dots'} BackgroundType
	 * @typedef {'full' | 'split' | 'diagonal'} LayoutType
	 */

	/** @type {{ background?: BackgroundType, layout?: LayoutType }} */
	let { background = 'starry-night', layout = 'full' } = $props();
</script>

<!-- White background for split/diagonal layouts -->
{#if layout === 'split' || layout === 'diagonal'}
	<div class="fixed inset-0 bg-white z-0"></div>
{/if}

<!-- Starry Night -->
{#if background === 'starry-night'}
	<div class="animation-bg bg-1 layout-{layout}">
		<div class="stars"></div>
		<div class="shooting-star"></div>
		<div class="shooting-star"></div>
		<div class="shooting-star"></div>
	</div>
{/if}

<!-- Sliding Diagonals -->
{#if background === 'sliding-diagonals'}
	<div class="animation-bg layout-{layout}">
		<div class="bg-slide"></div>
		<div class="bg-slide bg-slide-2"></div>
		<div class="bg-slide bg-slide-3"></div>
	</div>
{/if}

<!-- Rainbow Lines -->
{#if background === 'rainbow-lines'}
	<div class="animation-bg bg-3 layout-{layout}">
		<!-- eslint-disable-next-line svelte/require-each-key, no-unused-vars -- array index used for styling only, no unique identifiers -->
		{#each Array(25) as _, i}
			<div class="rainbow" style="--i: {i}"></div>
		{/each}
		<div class="h-edge"></div>
		<div class="v-edge"></div>
	</div>
{/if}

<!-- Rainbow Gradient -->
{#if background === 'rainbow-gradient'}
	<div class="animation-bg bg-4 layout-{layout}">
		<div class="gradient-scroll"></div>
	</div>
{/if}

<!-- Modern Gradient -->
{#if background === 'modern-gradient'}
	<div class="animation-bg bg-5 layout-{layout}">
		<div class="gradient-background">
			<div class="gradient-sphere sphere-1"></div>
			<div class="gradient-sphere sphere-2"></div>
			<div class="gradient-sphere sphere-3"></div>
			<div class="glow"></div>
			<div class="grid-overlay"></div>
			<div class="noise-overlay"></div>
		</div>
	</div>
{/if}

<!-- Bokeh Dots -->
{#if background === 'bokeh-dots'}
	<div class="animation-bg bg-6 layout-{layout}">
		<div class="bokeh-dots"></div>
		<div class="bokeh-dots bokeh-dots-2"></div>
		<div class="bokeh-dots bokeh-dots-3"></div>
		<div class="bokeh-dots bokeh-dots-4"></div>
	</div>
{/if}

<style>
	.animation-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		overflow: hidden;
	}

	/* ============================================
	   LAYOUT MODES
	   ============================================ */

	/* Split vertical layout */
	.animation-bg.layout-split {
		width: 50%;
		clip-path: none;
	}

	/* Diagonal cut layout */
	.animation-bg.layout-diagonal {
		clip-path: polygon(0 0, 65% 0, 35% 100%, 0 100%);
	}

	/* ============================================
	   ANIMATION 1: Starry Night
	   ============================================ */
	.bg-1 {
		background: linear-gradient(to bottom, #1a1a3d, #2d2d5a 70%, #0d0d1f);
	}

	.stars {
		width: 1px;
		height: 1px;
		position: absolute;
		background: white;
		box-shadow:
			2vw 5vh 2px white,
			10vw 8vh 2px white,
			15vw 15vh 1px white,
			22vw 22vh 1px white,
			28vw 12vh 2px white,
			32vw 32vh 1px white,
			38vw 18vh 2px white,
			42vw 35vh 1px white,
			48vw 25vh 2px white,
			53vw 42vh 1px white,
			58vw 15vh 2px white,
			63vw 38vh 1px white,
			68vw 28vh 2px white,
			73vw 45vh 1px white,
			78vw 32vh 2px white,
			83vw 48vh 1px white,
			88vw 20vh 2px white,
			93vw 52vh 1px white,
			98vw 35vh 2px white,
			5vw 60vh 1px white,
			12vw 65vh 2px white,
			18vw 72vh 1px white,
			25vw 78vh 2px white,
			30vw 85vh 1px white,
			35vw 68vh 2px white,
			40vw 82vh 1px white,
			45vw 92vh 2px white,
			50vw 75vh 1px white,
			55vw 88vh 2px white,
			60vw 95vh 1px white,
			65vw 72vh 2px white,
			70vw 85vh 1px white,
			75vw 78vh 2px white,
			80vw 92vh 1px white,
			85vw 82vh 2px white,
			90vw 88vh 1px white,
			95vw 75vh 2px white;
		animation: twinkle 8s infinite linear;
	}

	.stars::after {
		content: '';
		position: absolute;
		width: 1px;
		height: 1px;
		background: white;
		box-shadow:
			8vw 12vh 2px white,
			16vw 18vh 1px white,
			24vw 25vh 2px white,
			33vw 15vh 1px white,
			41vw 28vh 2px white,
			49vw 35vh 1px white,
			57vw 22vh 2px white,
			65vw 42vh 1px white,
			73vw 28vh 2px white,
			81vw 48vh 1px white,
			89vw 32vh 2px white,
			97vw 45vh 1px white,
			3vw 68vh 2px white,
			11vw 75vh 1px white,
			19vw 82vh 2px white,
			27vw 88vh 1px white,
			35vw 72vh 2px white,
			43vw 85vh 1px white,
			51vw 92vh 2px white,
			59vw 78vh 1px white;
		animation: twinkle 6s infinite linear reverse;
	}

	.shooting-star {
		position: absolute;
		width: 100px;
		height: 2px;
		background: linear-gradient(90deg, transparent, white);
		animation: shoot 3s infinite ease-in;
	}

	.shooting-star:nth-child(2) {
		left: -100px;
		top: 20%;
		animation-delay: 0s;
	}
	.shooting-star:nth-child(3) {
		left: -100px;
		top: 35%;
		animation-delay: 1s;
	}
	.shooting-star:nth-child(4) {
		left: -100px;
		top: 50%;
		animation-delay: 2s;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.8;
		}
		50% {
			opacity: 0.4;
		}
	}

	@keyframes shoot {
		0% {
			transform: translateX(-100px) translateY(0) rotate(25deg);
			opacity: 1;
		}
		100% {
			transform: translateX(120vw) translateY(75vh) rotate(25deg);
			opacity: 0;
		}
	}

	/* ============================================
	   ANIMATION 2: Sliding Diagonals
	   ============================================ */
	.bg-slide {
		animation: slide 10s ease-in-out infinite alternate;
		background-image: linear-gradient(-60deg, #4a4a8a 50%, #8a6a00 50%);
		position: absolute;
		left: -50%;
		right: -50%;
		top: 0;
		bottom: 0;
		opacity: 0.4;
	}

	.bg-slide-2 {
		animation-direction: alternate-reverse;
		animation-duration: 14s;
	}

	.bg-slide-3 {
		animation-duration: 18s;
	}

	@keyframes slide {
		0% {
			transform: translateX(-15%);
		}
		100% {
			transform: translateX(15%);
		}
	}

	/* ============================================
	   ANIMATION 3: Rainbow Lines
	   ============================================ */
	.bg-3 {
		background: white;
	}

	.rainbow {
		height: 100vh;
		width: 0;
		top: 0;
		position: absolute;
		transform: rotate(10deg);
		transform-origin: top right;
		animation: rainbow-slide 20s linear infinite;
	}

	.rainbow:nth-child(1) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -0.8s;
	}
	.rainbow:nth-child(2) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -1.6s;
	}
	.rainbow:nth-child(3) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -2.4s;
	}
	.rainbow:nth-child(4) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -3.2s;
	}
	.rainbow:nth-child(5) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -4s;
	}
	.rainbow:nth-child(6) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -4.8s;
	}
	.rainbow:nth-child(7) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -5.6s;
	}
	.rainbow:nth-child(8) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -6.4s;
	}
	.rainbow:nth-child(9) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -7.2s;
	}
	.rainbow:nth-child(10) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -8s;
	}
	.rainbow:nth-child(11) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -8.8s;
	}
	.rainbow:nth-child(12) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -9.6s;
	}
	.rainbow:nth-child(13) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -10.4s;
	}
	.rainbow:nth-child(14) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -11.2s;
	}
	.rainbow:nth-child(15) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -12s;
	}
	.rainbow:nth-child(16) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -12.8s;
	}
	.rainbow:nth-child(17) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -13.6s;
	}
	.rainbow:nth-child(18) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -14.4s;
	}
	.rainbow:nth-child(19) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -15.2s;
	}
	.rainbow:nth-child(20) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -16s;
	}
	.rainbow:nth-child(21) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -16.8s;
	}
	.rainbow:nth-child(22) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -17.6s;
	}
	.rainbow:nth-child(23) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(96 165 250),
			0 0 50px 25px rgb(94 234 212),
			50px 0 50px 25px rgb(232 121 249),
			130px 0 80px 40px white;
		animation-delay: -18.4s;
	}
	.rainbow:nth-child(24) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(94 234 212),
			0 0 50px 25px rgb(232 121 249),
			50px 0 50px 25px rgb(96 165 250),
			130px 0 80px 40px white;
		animation-delay: -19.2s;
	}
	.rainbow:nth-child(25) {
		box-shadow:
			-130px 0 80px 40px white,
			-50px 0 50px 25px rgb(232 121 249),
			0 0 50px 25px rgb(96 165 250),
			50px 0 50px 25px rgb(94 234 212),
			130px 0 80px 40px white;
		animation-delay: -20s;
	}

	@keyframes rainbow-slide {
		from {
			right: -25vw;
		}
		to {
			right: 125vw;
		}
	}

	.h-edge {
		box-shadow: 0 0 50vh 40vh white;
		width: 100vw;
		height: 0;
		bottom: 0;
		left: 0;
		position: absolute;
	}

	.v-edge {
		box-shadow: 0 0 35vw 25vw white;
		width: 0;
		height: 100vh;
		bottom: 0;
		left: 0;
		position: absolute;
	}

	/* ============================================
	   ANIMATION 4: Rainbow Gradient
	   ============================================ */
	.bg-4 {
		background-color: #1a1a2e;
	}

	.gradient-scroll {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.gradient-scroll::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 1000vh;
		background: linear-gradient(
			0deg,
			rgb(60, 50, 140) 0%,
			rgb(140, 30, 100) 20%,
			rgb(150, 45, 60) 40%,
			rgb(140, 120, 50) 60%,
			rgb(30, 130, 130) 80%,
			rgb(50, 55, 140) 100%
		);
		animation: gradient-scroll-anim 40s infinite ease-in-out;
	}

	@keyframes gradient-scroll-anim {
		0% {
			top: 0;
		}
		50% {
			top: -900vh;
		}
		100% {
			top: 0;
		}
	}

	/* ============================================
	   ANIMATION 5: Modern Gradient
	   ============================================ */
	.bg-5 {
		background-color: #050505;
	}

	.gradient-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.gradient-sphere {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
	}

	.sphere-1 {
		width: 40vw;
		height: 40vw;
		background: linear-gradient(40deg, rgba(121, 121, 255, 0.8), rgba(255, 191, 0, 0.4));
		top: -10%;
		left: -10%;
		animation: float-1 15s ease-in-out infinite alternate;
	}

	.sphere-2 {
		width: 45vw;
		height: 45vw;
		background: linear-gradient(240deg, rgba(121, 121, 255, 0.8), rgba(0, 183, 255, 0.4));
		bottom: -20%;
		right: -10%;
		animation: float-2 18s ease-in-out infinite alternate;
	}

	.sphere-3 {
		width: 30vw;
		height: 30vw;
		background: linear-gradient(120deg, rgba(255, 191, 0, 0.5), rgba(121, 121, 255, 0.3));
		top: 60%;
		left: 20%;
		animation: float-3 20s ease-in-out infinite alternate;
	}

	.glow {
		position: absolute;
		width: 40vw;
		height: 40vh;
		background: radial-gradient(circle, rgba(121, 121, 255, 0.15), transparent 70%);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation: pulse 8s infinite alternate;
		filter: blur(30px);
	}

	.grid-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: 40px 40px;
		background-image:
			linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
	}

	.noise-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0.05;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
	}

	@keyframes float-1 {
		0% {
			transform: translate(0, 0) scale(1);
		}
		100% {
			transform: translate(10%, 10%) scale(1.1);
		}
	}

	@keyframes float-2 {
		0% {
			transform: translate(0, 0) scale(1);
		}
		100% {
			transform: translate(-10%, -5%) scale(1.15);
		}
	}

	@keyframes float-3 {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 0.3;
		}
		100% {
			transform: translate(-5%, 10%) scale(1.05);
			opacity: 0.6;
		}
	}

	@keyframes pulse {
		0% {
			opacity: 0.3;
			transform: translate(-50%, -50%) scale(0.9);
		}
		100% {
			opacity: 0.7;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	/* ============================================
	   ANIMATION 6: Bokeh Dots
	   ============================================ */
	.bg-6 {
		background: #123;
	}

	.bokeh-dots {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 3em;
		height: 3em;
		font-size: 52px;
		color: transparent;
		mix-blend-mode: screen;
		animation: bokeh-move 44s -27s ease-in-out infinite alternate;
		text-shadow:
			0.5em 0.5em 7px hsla(0, 100%, 50%, 0.9),
			-0.3em 1.2em 7px hsla(60, 100%, 50%, 0.9),
			1.5em -0.5em 7px hsla(120, 100%, 50%, 0.9),
			-1.2em -0.8em 7px hsla(180, 100%, 50%, 0.9),
			0.8em 1.8em 7px hsla(240, 100%, 50%, 0.9),
			-1.8em 0.3em 7px hsla(300, 100%, 50%, 0.9),
			2.2em 0.8em 7px hsla(30, 100%, 50%, 0.9),
			-0.5em -1.5em 7px hsla(90, 100%, 50%, 0.9),
			1em -1.2em 7px hsla(150, 100%, 50%, 0.9),
			-2em 1.5em 7px hsla(210, 100%, 50%, 0.9),
			0.2em 2.5em 7px hsla(270, 100%, 50%, 0.9),
			-1.5em -2em 7px hsla(330, 100%, 50%, 0.9),
			2.5em -0.2em 7px hsla(15, 100%, 50%, 0.9),
			-0.8em 0.8em 7px hsla(75, 100%, 50%, 0.9),
			1.8em 1.2em 7px hsla(135, 100%, 50%, 0.9),
			-2.2em -0.5em 7px hsla(195, 100%, 50%, 0.9),
			0.5em -2.2em 7px hsla(255, 100%, 50%, 0.9),
			-1em 2em 7px hsla(315, 100%, 50%, 0.9),
			2em -1.8em 7px hsla(45, 100%, 50%, 0.9),
			-2.5em 0.8em 7px hsla(105, 100%, 50%, 0.9);
	}

	.bokeh-dots::before {
		content: '.';
	}

	.bokeh-dots-2 {
		animation-duration: 43s;
		animation-delay: -32s;
		text-shadow:
			-0.8em 1.5em 7px hsla(20, 100%, 50%, 0.9),
			1.2em -0.3em 7px hsla(80, 100%, 50%, 0.9),
			-1.5em -1.2em 7px hsla(140, 100%, 50%, 0.9),
			0.3em 2.2em 7px hsla(200, 100%, 50%, 0.9),
			2em 0.5em 7px hsla(260, 100%, 50%, 0.9),
			-0.5em -2.5em 7px hsla(320, 100%, 50%, 0.9),
			1.8em -1.5em 7px hsla(40, 100%, 50%, 0.9),
			-2.2em 1em 7px hsla(100, 100%, 50%, 0.9),
			0.8em 1em 7px hsla(160, 100%, 50%, 0.9),
			-1em -0.8em 7px hsla(220, 100%, 50%, 0.9);
	}

	.bokeh-dots-3 {
		animation-duration: 42s;
		animation-delay: -23s;
		text-shadow:
			1.5em 0.8em 7px hsla(10, 100%, 50%, 0.9),
			-0.5em -1.8em 7px hsla(70, 100%, 50%, 0.9),
			2.2em -0.5em 7px hsla(130, 100%, 50%, 0.9),
			-1.8em 1.2em 7px hsla(190, 100%, 50%, 0.9),
			0.2em 2em 7px hsla(250, 100%, 50%, 0.9),
			-2.5em -0.2em 7px hsla(310, 100%, 50%, 0.9),
			1em -2.2em 7px hsla(50, 100%, 50%, 0.9),
			-1.2em 0.5em 7px hsla(110, 100%, 50%, 0.9),
			2.5em 1.5em 7px hsla(170, 100%, 50%, 0.9),
			-0.2em -1em 7px hsla(230, 100%, 50%, 0.9);
	}

	.bokeh-dots-4 {
		animation-duration: 41s;
		animation-delay: -19s;
		text-shadow:
			-1.2em 0.2em 7px hsla(5, 100%, 50%, 0.9),
			0.8em 1.5em 7px hsla(65, 100%, 50%, 0.9),
			-2em -1em 7px hsla(125, 100%, 50%, 0.9),
			1.5em -0.8em 7px hsla(185, 100%, 50%, 0.9),
			-0.5em 2.2em 7px hsla(245, 100%, 50%, 0.9),
			2.2em 0.2em 7px hsla(305, 100%, 50%, 0.9),
			-1.8em -1.5em 7px hsla(25, 100%, 50%, 0.9),
			0.5em -2em 7px hsla(85, 100%, 50%, 0.9),
			-2.5em 0.5em 7px hsla(145, 100%, 50%, 0.9),
			1.2em 1.8em 7px hsla(205, 100%, 50%, 0.9);
	}

	@keyframes bokeh-move {
		from {
			transform: rotate(0deg) scale(12) translateX(-20px);
		}
		to {
			transform: rotate(360deg) scale(18) translateX(20px);
		}
	}
</style>
