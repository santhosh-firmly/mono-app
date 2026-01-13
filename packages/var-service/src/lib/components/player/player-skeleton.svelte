<script>
	import Skeleton from '$lib/components/ui/skeleton.svelte';
</script>

<div>
	<!-- Header skeleton -->
	<header class="mb-12">
		<!-- Back button -->
		<Skeleton class="mb-3 h-5 w-20" />

		<!-- Title -->
		<Skeleton class="mb-1 h-8 w-64" />

		<!-- URL -->
		<Skeleton class="mb-3 h-5 w-96" />

		<!-- Session details -->
		<Skeleton class="h-4 w-full" />
	</header>

	<!-- Player skeleton - matches SessionPlayer layout with inline-block -->
	<div class="border-border inline-block w-full border bg-white">
		<!-- Player container - respects parent width, has minimum height -->
		<div>
			<Skeleton class="h-150" />
		</div>

		<!-- Controls skeleton - matches actual PlayerControls layout -->
		<div class="border-border border-t bg-white p-4">
			<div class="flex items-center gap-3 text-xs">
				<!-- Play button -->
				<Skeleton class="h-6 w-14" />

				<!-- Time display -->
				<Skeleton class="h-4 w-24" />

				<!-- Progress bar/slider -->
				<div class="relative flex-1">
					<Skeleton class="h-1.5 w-full" />
				</div>

				<!-- Speed controls -->
				<div class="border-border flex gap-1 border-l pl-3">
					<Skeleton class="h-6 w-10" />
					<Skeleton class="h-6 w-10" />
					<Skeleton class="h-6 w-10" />
					<Skeleton class="h-6 w-10" />
				</div>

				<!-- Skip idle button -->
				<div class="border-border border-l pl-3">
					<Skeleton class="h-6 w-20" />
				</div>

				<!-- Fullscreen button -->
				<div class="border-border border-l pl-3">
					<Skeleton class="h-6 w-24" />
				</div>
			</div>
		</div>
	</div>
</div>
