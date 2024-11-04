<script>
	// @ts-nocheck

	export let name;
	export let logoUrl;
	export let logoBg;
</script>

<img
	class="merchant-card-logo p-1"
	src={logoUrl}
	alt="{name} logo"
	loading="lazy"
	style="object-fit:contain;object-position:50% 50%; background-color:{logoBg}"
/>

<style>
	.merchant-card-logo {
		background: #fff;
		border-radius: 50%;
		box-shadow: 0 2px 13px 0 rgba(0, 0, 0, 0.11);
		height: 64px;
		position: relative;
		width: 64px;
		z-index: 1;
	}
</style>
