<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectionCard from './selection-card.svelte';
	import Zap from 'lucide-svelte/icons/zap';
	import Shield from 'lucide-svelte/icons/shield';
	import Rocket from 'lucide-svelte/icons/rocket';

	const { Story } = defineMeta({
		title: 'Merchant/UI/Selection Card',
		component: SelectionCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			selected: { control: 'boolean' },
			title: { control: 'text' },
			description: { control: 'text' },
			iconClass: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-md">
		<SelectionCard {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		icon: Zap,
		title: 'Quick Setup',
		description: 'Get started quickly with our automated setup process.',
		selected: false
	}}
	{template}
/>

<Story
	name="Selected"
	args={{
		icon: Zap,
		title: 'Quick Setup',
		description: 'Get started quickly with our automated setup process.',
		selected: true
	}}
	{template}
/>

<Story
	name="With Features"
	args={{
		icon: Shield,
		title: 'Enterprise Plan',
		description: 'Best for large organizations with advanced security needs.',
		selected: false,
		features: [
			{ text: 'Unlimited team members' },
			{ text: 'Advanced security controls' },
			{ text: 'Priority support' },
			{ text: 'Custom integrations' }
		]
	}}
	{template}
/>

<Story
	name="With Recommendation"
	args={{
		icon: Rocket,
		title: 'Pro Plan',
		description: 'Perfect for growing businesses.',
		selected: true,
		features: [
			{ text: 'Up to 10 team members' },
			{ text: 'Advanced analytics' },
			{ text: 'Email support' }
		],
		recommendation: {
			text: '<strong>Recommended</strong> for your business size',
			variant: 'primary'
		}
	}}
	{template}
/>

<Story
	name="Secondary Recommendation"
	args={{
		icon: Shield,
		title: 'Custom Solution',
		description: 'Tailored to your specific requirements.',
		selected: false,
		recommendation: {
			text: 'Contact sales for custom pricing',
			variant: 'secondary'
		}
	}}
	{template}
/>

<Story name="Selection Group">
	<div class="space-y-4">
		<SelectionCard
			icon={Zap}
			title="Starter"
			description="Perfect for individuals and small teams."
			features={[{ text: 'Up to 3 team members' }, { text: 'Basic analytics' }]}
			selected={false}
		/>
		<SelectionCard
			icon={Rocket}
			title="Pro"
			description="Best for growing businesses."
			features={[
				{ text: 'Up to 10 team members' },
				{ text: 'Advanced analytics' },
				{ text: 'Priority support' }
			]}
			recommendation={{ text: '<strong>Most popular</strong> choice', variant: 'primary' }}
			selected={true}
		/>
		<SelectionCard
			icon={Shield}
			title="Enterprise"
			description="For large organizations."
			features={[
				{ text: 'Unlimited team members' },
				{ text: 'Custom integrations' },
				{ text: 'Dedicated support' }
			]}
			selected={false}
		/>
	</div>
</Story>
