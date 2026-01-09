<script>
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	let { data = [] } = $props();

	let canvas;
	let chart;

	// Get theme-aware colors
	function isDarkMode() {
		return (
			typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
		);
	}

	function getThemeColors() {
		const dark = isDarkMode();
		return {
			legendColor: dark ? '#a6a6a6' : '#374151',
			tickColor: dark ? '#a6a6a6' : '#9ca3af',
			gridColor: dark ? '#333333' : '#f3f4f6'
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
			type: 'bar',
			data: {
				labels: data.map((d) => d.name),
				datasets: [
					{
						label: 'Orders',
						data: data.map((d) => d.orders),
						backgroundColor: '#8b5cf6',
						borderRadius: 4,
						yAxisID: 'y'
					},
					{
						label: 'Revenue',
						data: data.map((d) => d.revenue),
						backgroundColor: '#10b981',
						borderRadius: 4,
						yAxisID: 'y1'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						position: 'top',
						align: 'end',
						labels: {
							usePointStyle: true,
							pointStyle: 'rect',
							padding: 16,
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
								const label = context.dataset.label;
								const value = context.parsed.y;
								if (label === 'Revenue') {
									return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
								}
								return `${label}: ${value.toLocaleString()}`;
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: themeColors.tickColor
						}
					},
					y: {
						type: 'linear',
						position: 'left',
						grid: {
							color: themeColors.gridColor
						},
						ticks: {
							color: themeColors.tickColor
						},
						title: {
							display: true,
							text: 'Orders',
							color: themeColors.tickColor
						}
					},
					y1: {
						type: 'linear',
						position: 'right',
						grid: {
							drawOnChartArea: false
						},
						ticks: {
							color: themeColors.tickColor,
							callback: (value) => '$' + value.toLocaleString()
						},
						title: {
							display: true,
							text: 'Revenue',
							color: themeColors.tickColor
						}
					}
				}
			}
		});
	}

	$effect(() => {
		if (chart && data.length) {
			chart.data.labels = data.map((d) => d.name);
			chart.data.datasets[0].data = data.map((d) => d.orders);
			chart.data.datasets[1].data = data.map((d) => d.revenue);
			chart.update('none');
		}
	});
</script>

<div class="h-[400px] w-full">
	<canvas bind:this={canvas}></canvas>
</div>
