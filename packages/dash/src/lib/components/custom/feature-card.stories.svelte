<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeatureCard from './feature-card.svelte';
	import { Settings, Users, CreditCard } from 'lucide-svelte';

	const { Story } = defineMeta({
		title: 'Data Display/Cards/Feature Card',
		component: FeatureCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			title: { control: 'text' },
			description: { control: 'text' },
			spacing: { control: 'text' }
		}
	});
</script>

{#snippet defaultContent()}
	<p class="text-sm text-muted-foreground">Feature content goes here.</p>
{/snippet}

{#snippet formContent()}
	<div class="space-y-4">
		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium">Field 1</label>
			<input type="text" placeholder="Enter value" class="rounded border px-3 py-2" />
		</div>
		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium">Field 2</label>
			<input type="text" placeholder="Enter value" class="rounded border px-3 py-2" />
		</div>
	</div>
{/snippet}

{#snippet template(args)}
	<FeatureCard {...args}>
		{@render defaultContent()}
	</FeatureCard>
{/snippet}

{#snippet formTemplate(args)}
	<FeatureCard {...args}>
		{@render formContent()}
	</FeatureCard>
{/snippet}

<Story
	name="Default"
	args={{
		title: 'General Settings',
		description: 'Configure basic settings for your account.',
		icon: Settings
	}}
	{template}
/>

<Story
	name="With Form Content"
	args={{
		title: 'User Profile',
		description: 'Update your personal information.',
		icon: Users,
		spacing: 'space-y-6'
	}}
	{formTemplate}
/>

<Story
	name="Without Icon"
	args={{
		title: 'Payment Settings',
		description: 'Configure payment methods and billing.'
	}}
	{template}
/>

<Story
	name="Custom Spacing"
	args={{
		title: 'Compact Card',
		description: 'Uses minimal spacing.',
		icon: CreditCard,
		spacing: 'space-y-2'
	}}
	{template}
/>
