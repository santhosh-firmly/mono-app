<script>
	import SignUp from '$lib/components/merchant/sign-up.svelte';
	import AnimatedBackground from '$lib/components/merchant/animated-background.svelte';
</script>

<AnimatedBackground background="starry-night" layout="diagonal" />

<div class="card-container">
	<SignUp />
</div>

<style>
	.card-container {
		position: relative;
		z-index: 10;
		display: flex;
		min-height: 100vh;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}
</style>
