<script>
	import '../../app.css';
	import './player.css';

	const { children } = $props();
</script>

<div class="w-full">
	{@render children()}
</div>
