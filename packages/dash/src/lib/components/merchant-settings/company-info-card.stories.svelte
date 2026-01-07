<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CompanyInfoCard from './company-info-card.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/Company Info Card',
		component: CompanyInfoCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			companyName: { control: 'text' },
			employeeCount: {
				control: 'select',
				options: ['', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
			},
			annualRevenue: {
				control: 'select',
				options: [
					'',
					'<$1M',
					'$1M-$10M',
					'$10M-$50M',
					'$50M-$100M',
					'$100M-$500M',
					'$500M+'
				]
			},
			addressStreet: { control: 'text' },
			addressCity: { control: 'text' },
			addressState: { control: 'text' },
			addressPostalCode: { control: 'text' },
			addressCountry: { control: 'text' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<script>
	// Default state
	let companyName = $state('Acme Corporation');
	let employeeCount = $state('51-200');
	let annualRevenue = $state('$10M-$50M');
	let addressStreet = $state('123 Innovation Drive');
	let addressCity = $state('San Francisco');
	let addressState = $state('CA');
	let addressPostalCode = $state('94102');
	let addressCountry = $state('United States');

	// Empty state
	let emptyCompanyName = $state('');
	let emptyEmployeeCount = $state('');
	let emptyAnnualRevenue = $state('');
	let emptyAddressStreet = $state('');
	let emptyAddressCity = $state('');
	let emptyAddressState = $state('');
	let emptyAddressPostalCode = $state('');
	let emptyAddressCountry = $state('');

	// Disabled state
	let disabledCompanyName = $state('Read Only Inc.');
	let disabledEmployeeCount = $state('1000+');
	let disabledAnnualRevenue = $state('$500M+');
	let disabledAddressStreet = $state('1 Enterprise Way');
	let disabledAddressCity = $state('New York');
	let disabledAddressState = $state('NY');
	let disabledAddressPostalCode = $state('10001');
	let disabledAddressCountry = $state('United States');
</script>

<Story name="Default">
	{#snippet template()}
		<CompanyInfoCard
			bind:companyName
			bind:employeeCount
			bind:annualRevenue
			bind:addressStreet
			bind:addressCity
			bind:addressState
			bind:addressPostalCode
			bind:addressCountry
			disabled={false}
		/>
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<CompanyInfoCard
			bind:companyName={emptyCompanyName}
			bind:employeeCount={emptyEmployeeCount}
			bind:annualRevenue={emptyAnnualRevenue}
			bind:addressStreet={emptyAddressStreet}
			bind:addressCity={emptyAddressCity}
			bind:addressState={emptyAddressState}
			bind:addressPostalCode={emptyAddressPostalCode}
			bind:addressCountry={emptyAddressCountry}
			disabled={false}
		/>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<CompanyInfoCard
			bind:companyName={disabledCompanyName}
			bind:employeeCount={disabledEmployeeCount}
			bind:annualRevenue={disabledAnnualRevenue}
			bind:addressStreet={disabledAddressStreet}
			bind:addressCity={disabledAddressCity}
			bind:addressState={disabledAddressState}
			bind:addressPostalCode={disabledAddressPostalCode}
			bind:addressCountry={disabledAddressCountry}
			disabled={true}
		/>
	{/snippet}
</Story>
