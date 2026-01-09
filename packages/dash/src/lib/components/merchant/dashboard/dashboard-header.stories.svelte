<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DashboardHeader from './dashboard-header.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Dashboard Header',
		component: DashboardHeader,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<DashboardHeader {...args} />
{/snippet}

<Story name="Default" args={{ userName: 'John Doe' }} {template} />

<Story
	name="With Custom Subtitle"
	args={{ userName: 'Jane Smith', subtitle: 'Welcome back! Your sales are up this week.' }}
	{template}
/>

<Story name="No User Name" args={{ userName: '' }} {template} />

<Story name="First Name Only" args={{ userName: 'Alex' }} {template} />
