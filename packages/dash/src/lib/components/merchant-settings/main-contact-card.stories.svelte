<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MainContactCard from './main-contact-card.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/Main Contact Card',
		component: MainContactCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			contactName: { control: 'text' },
			contactEmail: { control: 'text' },
			contactPhone: { control: 'text' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<script>
	// Default state
	let contactName = $state('John Smith');
	let contactEmail = $state('john.smith@acme.com');
	let contactPhone = $state('+1-555-123-4567');

	// Empty state
	let emptyContactName = $state('');
	let emptyContactEmail = $state('');
	let emptyContactPhone = $state('');

	// Minimal state (no phone)
	let minimalContactName = $state('Jane Doe');
	let minimalContactEmail = $state('jane@example.com');
	let minimalContactPhone = $state('');

	// Disabled state
	let disabledContactName = $state('Admin User');
	let disabledContactEmail = $state('admin@readonly.com');
	let disabledContactPhone = $state('+1-800-555-0199');
</script>

<Story name="Default">
	{#snippet template()}
		<MainContactCard bind:contactName bind:contactEmail bind:contactPhone disabled={false} />
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<MainContactCard
			bind:contactName={emptyContactName}
			bind:contactEmail={emptyContactEmail}
			bind:contactPhone={emptyContactPhone}
			disabled={false}
		/>
	{/snippet}
</Story>

<Story name="Without Phone">
	{#snippet template()}
		<MainContactCard
			bind:contactName={minimalContactName}
			bind:contactEmail={minimalContactEmail}
			bind:contactPhone={minimalContactPhone}
			disabled={false}
		/>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<MainContactCard
			bind:contactName={disabledContactName}
			bind:contactEmail={disabledContactEmail}
			bind:contactPhone={disabledContactPhone}
			disabled={true}
		/>
	{/snippet}
</Story>
