<script>
	// @ts-nocheck

	import Carousel from './carousel.svelte';
	import CategoryCard from './category-card.svelte';
	import { categories } from './data.js';
</script>

<section class="section-wrapper">
	<div class="carousel-container">
		<Carousel>
			{#each categories as category}
				<CategoryCard
					name={category.name}
					imageUrl={category.imgSrc}
					link={category.link}
					on:categoryChange
				/>
			{/each}
		</Carousel>
	</div>
</section>

<style>
	.section-wrapper {
		overflow-x: clip;
		position: relative;
		padding-bottom: 80px;
		padding-top: 0;
	}

	.carousel-container {
		margin-bottom: -15px;
		position: relative;
	}
</style>
