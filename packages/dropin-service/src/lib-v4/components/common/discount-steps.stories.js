import DiscountSteps from './discount-steps.svelte';

export default {
	title: 'Discount Steps',
	component: DiscountSteps,
	tags: ['autodocs'],
	argTypes: {
		numberOfSets: { type: 'boolean' },
		tiers: { type: 'array' }
	}
};

export const NoProgress = {
	args: {
		numberOfSets: 0,
		tiers: [
			{
				text: '40% OFF',
				sets: 1
			},
			{
				text: '45% OFF',
				sets: 2
			},
			{
				text: '50% OFF',
				sets: 3
			}
		]
	}
};

export const PartialProgress = {
	args: {
		numberOfSets: 2,
		tiers: [
			{
				text: '40% OFF',
				sets: 1
			},
			{
				text: '45% OFF',
				sets: 2
			},
			{
				text: '50% OFF',
				sets: 3
			}
		]
	}
};

export const MoreSetsThanMax = {
	args: {
		numberOfSets: 6,
		tiers: [
			{
				text: '40% OFF',
				sets: 1
			},
			{
				text: '45% OFF',
				sets: 2
			},
			{
				text: '50% OFF',
				sets: 3
			}
		]
	}
};

export const MoreTiers = {
	args: {
		numberOfSets: 3,
		tiers: [
			{
				text: '40% OFF',
				sets: 1
			},
			{
				text: '45% OFF',
				sets: 2
			},
			{
				text: '50% OFF',
				sets: 3
			},
			{
				text: '60% OFF',
				sets: 4
			},
			{
				text: '70% OFF',
				sets: 5
			},
			{
				text: '80% OFF',
				sets: 6
			}
		]
	}
};

export const SetGapBetweenTiers = {
	args: {
		numberOfSets: 3,
		tiers: [
			{
				text: '40% OFF',
				sets: 1
			},
			{
				text: '45% OFF',
				sets: 2
			},
			{
				text: '80% OFF',
				sets: 5
			}
		]
	}
};
