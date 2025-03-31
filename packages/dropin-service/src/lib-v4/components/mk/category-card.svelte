<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let link;
	export let imageUrl;
	export let name;
</script>

<div class="carousel-card-container">
	<button
		on:click={() => {
			dispatch('categoryChange', link);
		}}
		class="carousel-category-card"
		><div class="carousel-category-card-2">
			<div class="image-wrapper">
				<div style="max-width:305px;display:block">
					<img
						alt=""
						src="data:image/svg+xml;charset=utf-8,%3Csvg height='367' width='305' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E"
						style="max-width:100%;display:block;position:static"
					/>
				</div>
				<img
					style="opacity: 1;"
					sizes="(min-width: 305px) 305px, 100vw"
					decoding="async"
					loading="lazy"
					alt="Category"
					src={imageUrl}
				/>
			</div>
			<div class="card-text">
				<div class="card-text-name">{name}</div>
			</div>
		</div>
	</button>
</div>

<style>
	.carousel-card-container {
		height: 184px;
		max-width: 152px;
		width: 152px;
		flex: 0 0 auto;
		margin-bottom: 15px;
		margin-top: 4px;
	}
	.carousel-category-card {
		line-height: 0;
	}
	.carousel-category-card-2 {
		text-align: center;
		border-radius: 6px;
		cursor: pointer;
		display: inline-block;
		flex: 0 0 auto;
		overflow: hidden;
		position: relative;
		scroll-snap-align: start;
		text-decoration: none;
		transition:
			transform 0.5s cubic-bezier(0.19, 1, 0.22, 1),
			box-shadow 0.5s cubic-bezier(0.19, 1, 0.22, 1);
		z-index: 2;
	}
	.carousel-category-card-2:before {
		background: linear-gradient(180deg, #000, transparent);
		bottom: auto;
		top: 0;
		content: '';
		height: 50%;
		left: 0;
		opacity: 0.9;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.carousel-category-card-2:hover {
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.1),
			0 6px 10px rgba(0, 0, 0, 0.1);
		transform: translateY(-4px);
	}

	/* End of carousel */
	.image-wrapper {
		height: 100%;
		transition: transform 2s cubic-bezier(0.19, 1, 0.22, 1);
		display: inline-block;
		vertical-align: top;

		position: relative;
		overflow: hidden;
	}
	.image-wrapper:hover {
		transform: scale(1.1);
	}
	.image-wrapper img {
		bottom: 0;
		height: 100%;
		left: 0;
		margin: 0;
		max-width: none;
		padding: 0;
		position: absolute;
		right: 0;
		top: 0;
		width: 100%;
		object-fit: cover;
		border: 0;
	}
	.card-text {
		color: #fff;
		padding: 0 16px;
		position: absolute;
		top: 8px;
		white-space: normal;
		width: 100%;
		z-index: 2;
	}
	.card-text-name {
		font-family: Calibre, sans-serif;
		margin-bottom: 4px;
		font-size: 22px;
		font-weight: 600;
		line-height: 27px;
	}
</style>
