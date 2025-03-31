<script>
	// @ts-nocheck

	const SCROLL_STEP = 300;

	let carouselContainer;
	let hideLeftArrow = true;
	let hideRightArrow = false;

	function slideRight() {
		carouselContainer.scrollLeft += SCROLL_STEP;
	}

	function slideLeft() {
		carouselContainer.scrollLeft -= SCROLL_STEP;
	}

	function onContainerScroll() {
		var maxScrollLeft = carouselContainer.scrollWidth - carouselContainer.clientWidth;

		if (carouselContainer.scrollLeft <= 0) {
			hideLeftArrow = true;
		} else {
			hideLeftArrow = false;
		}

		if (carouselContainer.scrollLeft >= maxScrollLeft) {
			hideRightArrow = true;
		} else {
			hideRightArrow = false;
		}
	}
</script>

<div class="carousel-outer">
	<div bind:this={carouselContainer} on:scroll={onContainerScroll} class="carousel">
		<slot />
	</div>
	<div class="carousel-arrows-container">
		<button class="carousel-arrow" class:hidden-arrow={hideLeftArrow} on:click={slideLeft}>
			<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
				><g filter="url(#filter0_d-left)"><circle cx="28" cy="26" r="24" fill="#fff" /></g><path
					clip-rule="evenodd"
					d="M31.61 15.724a1.333 1.333 0 0 0-1.886 0l-9.428 9.428c-.52.52-.52 1.365 0 1.885l9.428 9.428a1.333 1.333 0 1 0 1.886-1.885l-8.485-8.485 8.485-8.486c.52-.52.52-1.365 0-1.885Z"
				/><defs
					><filter
						id="filter0_d-left"
						x="0"
						y="0"
						width="56"
						height="56"
						filterUnits="userSpaceOnUse"
						color-interpolation-filters="sRGB"
						><feFlood flood-opacity="0" result="BackgroundImageFix" /><feColorMatrix
							in="SourceAlpha"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						/><feOffset dy="2" /><feGaussianBlur stdDeviation="2" /><feColorMatrix
							values="0 0 0 0 0.0235294 0 0 0 0 0.0313726 0 0 0 0 0.0352941 0 0 0 0.16 0"
						/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow" /><feBlend
							in="SourceGraphic"
							in2="effect1_dropShadow"
							result="shape"
						/></filter
					></defs
				></svg
			>
		</button>
		<button class="carousel-arrow" class:hidden-arrow={hideRightArrow} on:click={slideRight}>
			<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
				><g filter="url(#filter0_d)"
					><circle r="24" transform="matrix(-1 0 0 1 28 26)" fill="#fff" /></g
				><path
					clip-rule="evenodd"
					d="M24.39 15.724c.52-.521 1.365-.521 1.886 0l9.428 9.428c.52.52.52 1.365 0 1.885l-9.428 9.428a1.333 1.333 0 1 1-1.886-1.885l8.486-8.485-8.486-8.486a1.333 1.333 0 0 1 0-1.885Z"
				/><defs
					><filter
						id="filter0_d"
						x="0"
						y="0"
						width="56"
						height="56"
						filterUnits="userSpaceOnUse"
						color-interpolation-filters="sRGB"
						><feFlood flood-opacity="0" result="BackgroundImageFix" /><feColorMatrix
							in="SourceAlpha"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						/><feOffset dy="2" /><feGaussianBlur stdDeviation="2" /><feColorMatrix
							values="0 0 0 0 0.0235294 0 0 0 0 0.0313726 0 0 0 0 0.0352941 0 0 0 0.16 0"
						/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow" /><feBlend
							in="SourceGraphic"
							in2="effect1_dropShadow"
							result="shape"
						/></filter
					></defs
				></svg
			>
		</button>
	</div>
</div>

<style>
	.carousel-outer {
		position: relative;
	}
	.carousel {
		padding-left: 110px;
		padding-right: 110px;
		-webkit-overflow-scrolling: touch;
		-ms-overflow-style: none;
		display: flex;
		flex-wrap: nowrap;
		gap: 24px;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-behavior: smooth;
		scrollbar-width: none;
	}
	.carousel::-webkit-scrollbar {
		display: none;
	}
	.carousel-arrows-container {
		pointer-events: none;
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: space-between;
		padding: 0 32px;
		position: absolute;
		top: 0;
		width: 100%;
		z-index: 3;
	}
	.carousel-arrow {
		cursor: pointer;
		display: inline-flex;
		margin-bottom: 11px;
		pointer-events: auto;
		transform: scale3d(0.75, 0.75, 0.75);
		transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
	}
	.carousel-arrows-container:hover .carousel-arrow {
		transform: scaleX(1);
	}
	.carousel-arrow svg {
		fill: #4c7cec;
		transition: fill 0.3s ease;
	}
	.carousel-arrow svg:hover {
		fill: #fff;
	}
	.carousel-arrow:hover svg circle {
		fill: #4c7cec;
	}
	.hidden-arrow {
		opacity: 0%;
	}
</style>
