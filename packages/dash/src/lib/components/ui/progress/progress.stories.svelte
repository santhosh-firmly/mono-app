<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Progress } from '$lib/components/ui/progress/index.js';

	const { Story } = defineMeta({
		title: 'Feedback/Progress',
		component: Progress,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 }
			},
			max: {
				control: { type: 'number', min: 1 }
			}
		}
	});
</script>

<script>
	let animatedValue = $state(0);

	$effect(() => {
		const interval = setInterval(() => {
			animatedValue = animatedValue >= 100 ? 0 : animatedValue + 10;
		}, 500);
		return () => clearInterval(interval);
	});
</script>

{#snippet template(args)}
	<div class="w-64">
		<Progress {...args} />
	</div>
{/snippet}

<Story name="Default" args={{ value: 50 }} {template} />

<Story name="Different Values">
	{#snippet template()}
		<div class="flex w-64 flex-col gap-4">
			<div>
				<span class="mb-1 block text-sm text-muted-foreground">0%</span>
				<Progress value={0} />
			</div>
			<div>
				<span class="mb-1 block text-sm text-muted-foreground">25%</span>
				<Progress value={25} />
			</div>
			<div>
				<span class="mb-1 block text-sm text-muted-foreground">50%</span>
				<Progress value={50} />
			</div>
			<div>
				<span class="mb-1 block text-sm text-muted-foreground">75%</span>
				<Progress value={75} />
			</div>
			<div>
				<span class="mb-1 block text-sm text-muted-foreground">100%</span>
				<Progress value={100} />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Animated">
	{#snippet template()}
		<div class="w-64">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Loading...</span>
				<span class="text-sm font-medium">{animatedValue}%</span>
			</div>
			<Progress value={animatedValue} />
		</div>
	{/snippet}
</Story>

<Story name="With Label">
	{#snippet template()}
		<div class="w-64">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Upload Progress</span>
				<span class="text-sm text-muted-foreground">75%</span>
			</div>
			<Progress value={75} />
		</div>
	{/snippet}
</Story>

<Story name="Custom Max">
	{#snippet template()}
		<div class="w-64">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Steps Completed</span>
				<span class="text-sm text-muted-foreground">3 of 5</span>
			</div>
			<Progress value={3} max={5} />
		</div>
	{/snippet}
</Story>
