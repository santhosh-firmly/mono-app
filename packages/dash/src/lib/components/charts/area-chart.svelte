<script>
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	let {
		data = [],
		comparisonData = [],
		label = 'Revenue',
		comparisonLabel = 'Last Month',
		color = '#8b5cf6',
		comparisonColor = '#9ca3af'
	} = $props();

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
			legendColor: dark ? '#a6a6a6' : '#6b7280',
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

	function getMaxValue() {
		const currentMax = Math.max(...data.map((d) => d.revenue || 0), 0);
		const comparisonMax = hasComparisonData()
			? Math.max(...comparisonData.map((d) => d.revenue || 0), 0)
			: 0;
		return Math.max(currentMax, comparisonMax);
	}

	// Check if comparison data exists and has actual revenue (not all zeros)
	function hasComparisonData() {
		return comparisonData.length > 0 && comparisonData.some((d) => d.revenue > 0);
	}

	function createChart() {
		if (!canvas || !data.length) return;

		const ctx = canvas.getContext('2d');
		const themeColors = getThemeColors();

		// Calculate max value from both series for Y-axis scale
		const maxValue = getMaxValue();
		// Add 10% padding to the top and round to a nice number
		const suggestedMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : undefined;

		// Create gradient for current month
		const gradient = ctx.createLinearGradient(0, 0, 0, 300);
		gradient.addColorStop(0, color + '40');
		gradient.addColorStop(1, color + '00');

		// Build datasets - always include current month
		const datasets = [
			{
				label,
				data: data.map((d) => d.revenue),
				borderColor: color,
				backgroundColor: gradient,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 6,
				pointHoverBackgroundColor: color,
				pointHoverBorderColor: isDarkMode() ? '#1f1f1f' : '#fff',
				pointHoverBorderWidth: 2,
				order: 1 // Draw on top
			}
		];

		// Add comparison dataset if data exists and has actual revenue
		if (hasComparisonData()) {
			datasets.push({
				label: comparisonLabel,
				data: comparisonData.map((d) => d.revenue),
				borderColor: comparisonColor,
				borderDash: [5, 5],
				backgroundColor: 'transparent',
				fill: false,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 4,
				pointHoverBackgroundColor: comparisonColor,
				pointHoverBorderColor: isDarkMode() ? '#1f1f1f' : '#fff',
				pointHoverBorderWidth: 2,
				order: 2 // Draw behind
			});
		}

		// Use comparison data for labels if available (full month), otherwise use current data
		const labelsSource =
			hasComparisonData() && comparisonData.length > data.length ? comparisonData : data;

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labelsSource.map((d) => d.day || d.date),
				datasets
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
						display: hasComparisonData(),
						position: 'bottom',
						labels: {
							usePointStyle: true,
							pointStyle: 'line',
							padding: 20,
							color: themeColors.legendColor
						}
					},
					tooltip: {
						backgroundColor: isDarkMode() ? '#333333' : '#1f2937',
						titleColor: '#fff',
						bodyColor: '#fff',
						padding: 12,
						cornerRadius: 8,
						displayColors: true,
						callbacks: {
							title: (context) => {
								const day = context[0].label;
								return `Day ${day}`;
							},
							label: (context) => {
								const datasetLabel = context.dataset.label;
								const value = context.parsed.y;
								return `${datasetLabel}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
							color: themeColors.tickColor,
							callback: function (value, index) {
								const day = index + 1;
								return day % 5 === 0 ? day : '';
							},
							maxRotation: 0
						}
					},
					y: {
						grid: {
							color: themeColors.gridColor
						},
						ticks: {
							color: themeColors.tickColor,
							callback: (value) => '$' + value.toLocaleString()
						},
						beginAtZero: true,
						suggestedMax
					}
				}
			}
		});
	}

	$effect(() => {
		if (chart && data.length) {
			// Use comparison data for labels if available (full month), otherwise use current data
			const labelsSource =
				hasComparisonData() && comparisonData.length > data.length ? comparisonData : data;
			chart.data.labels = labelsSource.map((d) => d.day || d.date);
			chart.data.datasets[0].data = data.map((d) => d.revenue);

			// Update comparison dataset if it exists and has actual revenue
			if (chart.data.datasets[1] && hasComparisonData()) {
				chart.data.datasets[1].data = comparisonData.map((d) => d.revenue);
			}

			// Update Y-axis scale based on both series
			const maxValue = getMaxValue();
			chart.options.scales.y.suggestedMax =
				maxValue > 0 ? Math.ceil(maxValue * 1.1) : undefined;

			chart.update('none');
		}
	});
</script>

<div class="h-[300px] w-full">
	<canvas bind:this={canvas}></canvas>
</div>
