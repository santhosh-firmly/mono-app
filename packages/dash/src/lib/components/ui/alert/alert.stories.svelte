<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert/index.js';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
	import Info from 'lucide-svelte/icons/info';

	const { Story } = defineMeta({
		title: 'Feedback/Alert',
		component: Alert,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'destructive']
			}
		}
	});
</script>

{#snippet template(args)}
	<Alert {...args}>
		<AlertTitle>Alert Title</AlertTitle>
		<AlertDescription>This is an alert description with more details.</AlertDescription>
	</Alert>
{/snippet}

<Story name="Default" args={{ variant: 'default' }} {template} />
<Story name="Destructive" args={{ variant: 'destructive' }} {template} />

<Story name="With Icon">
	{#snippet template()}
		<Alert>
			<AlertCircle class="h-4 w-4" />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>You can add components to your app using the CLI.</AlertDescription>
		</Alert>
	{/snippet}
</Story>

<Story name="Info Alert">
	{#snippet template()}
		<Alert>
			<Info class="h-4 w-4" />
			<AlertTitle>Information</AlertTitle>
			<AlertDescription
				>This is an informational message to help guide the user.</AlertDescription
			>
		</Alert>
	{/snippet}
</Story>

<Story name="Success Alert">
	{#snippet template()}
		<Alert
			class="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600"
		>
			<CheckCircle2 class="h-4 w-4" />
			<AlertTitle>Success</AlertTitle>
			<AlertDescription>Your changes have been saved successfully.</AlertDescription>
		</Alert>
	{/snippet}
</Story>

<Story name="Warning Alert">
	{#snippet template()}
		<Alert
			class="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600"
		>
			<AlertTriangle class="h-4 w-4" />
			<AlertTitle>Warning</AlertTitle>
			<AlertDescription
				>Your session is about to expire. Please save your work.</AlertDescription
			>
		</Alert>
	{/snippet}
</Story>

<Story name="Error Alert">
	{#snippet template()}
		<Alert variant="destructive">
			<AlertCircle class="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>Something went wrong. Please try again later.</AlertDescription>
		</Alert>
	{/snippet}
</Story>

<Story name="All Variants">
	{#snippet template()}
		<div class="flex flex-col gap-4">
			<Alert>
				<Info class="h-4 w-4" />
				<AlertTitle>Information</AlertTitle>
				<AlertDescription>This is an informational alert.</AlertDescription>
			</Alert>

			<Alert
				class="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600"
			>
				<CheckCircle2 class="h-4 w-4" />
				<AlertTitle>Success</AlertTitle>
				<AlertDescription>Operation completed successfully.</AlertDescription>
			</Alert>

			<Alert
				class="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600"
			>
				<AlertTriangle class="h-4 w-4" />
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>Please review before continuing.</AlertDescription>
			</Alert>

			<Alert variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>An error occurred.</AlertDescription>
			</Alert>
		</div>
	{/snippet}
</Story>
