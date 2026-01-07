<script>
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	let { data = [], valueKey = 'orders' } = $props();

	let canvas;
	let chart;

	const colors = [
		'#8b5cf6',
		'#3b82f6',
		'#ec4899',
		'#10b981',
		'#f59e0b',
		'#6366f1',
		'#14b8a6',
		'#f43f5e'
	];

	// Get theme-aware colors
	function isDarkMode() {
		return (
			typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
		);
	}

	function getThemeColors() {
		const dark = isDarkMode();
		return {
			legendColor: dark ? '#a6a6a6' : '#374151'
		};
	}

	onMount(() => {
		createChart();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});

	function createChart() {
		if (!canvas || !data.length) return;

		const ctx = canvas.getContext('2d');
		const themeColors = getThemeColors();

		chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: data.map((d) => d.name),
				datasets: [
					{
						data: data.map((d) => d[valueKey]),
						backgroundColor: data.map((_, i) => colors[i % colors.length]),
						borderWidth: 0,
						hoverOffset: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '60%',
				plugins: {
					legend: {
						position: 'right',
						labels: {
							padding: 16,
							usePointStyle: true,
							pointStyle: 'circle',
							color: themeColors.legendColor,
							font: {
								size: 12
							}
						}
					},
					tooltip: {
						backgroundColor: isDarkMode() ? '#333333' : '#1f2937',
						titleColor: '#fff',
						bodyColor: '#fff',
						padding: 12,
						cornerRadius: 8,
						callbacks: {
							label: (context) => {
								const total = context.dataset.data.reduce((a, b) => a + b, 0);
								const value = context.parsed;
								const percentage = ((value / total) * 100).toFixed(1);
								return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
							}
						}
					}
				}
			}
		});
	}

	$effect(() => {
		if (chart && data.length) {
			chart.data.labels = data.map((d) => d.name);
			chart.data.datasets[0].data = data.map((d) => d[valueKey]);
			chart.update('none');
		}
	});
</script>

<div class="h-[300px] w-full">
	<canvas bind:this={canvas}></canvas>
</div>
