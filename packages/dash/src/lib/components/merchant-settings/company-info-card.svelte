<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Building2 from 'lucide-svelte/icons/building-2';

	let {
		companyName = $bindable(''),
		employeeCount = $bindable(''),
		annualRevenue = $bindable(''),
		addressStreet = $bindable(''),
		addressCity = $bindable(''),
		addressState = $bindable(''),
		addressPostalCode = $bindable(''),
		addressCountry = $bindable(''),
		disabled = false
	} = $props();

	const employeeCountOptions = [
		{ value: '1-10', label: '1-10 employees' },
		{ value: '11-50', label: '11-50 employees' },
		{ value: '51-200', label: '51-200 employees' },
		{ value: '201-500', label: '201-500 employees' },
		{ value: '501-1000', label: '501-1000 employees' },
		{ value: '1000+', label: '1000+ employees' }
	];

	const annualRevenueOptions = [
		{ value: '<$1M', label: 'Less than $1M' },
		{ value: '$1M-$10M', label: '$1M - $10M' },
		{ value: '$10M-$50M', label: '$10M - $50M' },
		{ value: '$50M-$100M', label: '$50M - $100M' },
		{ value: '$100M-$500M', label: '$100M - $500M' },
		{ value: '$500M+', label: '$500M+' }
	];
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
				<Building2 class="h-5 w-5 text-blue-600" />
			</div>
			<div>
				<Card.Title>Company Information</Card.Title>
				<Card.Description>Details about your company</Card.Description>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-6">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<Label for="companyName">Company Name</Label>
				<Input
					id="companyName"
					bind:value={companyName}
					placeholder="Acme Corporation"
					{disabled}
				/>
			</div>
			<div class="space-y-2">
				<Label for="employeeCount">Employee Count</Label>
				<Select.Root
					type="single"
					name="employeeCount"
					bind:value={employeeCount}
					{disabled}
				>
					<Select.Trigger class="w-full">
						{employeeCountOptions.find((o) => o.value === employeeCount)?.label ||
							'Select employee count'}
					</Select.Trigger>
					<Select.Content>
						{#each employeeCountOptions as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="annualRevenue">Annual Revenue</Label>
			<Select.Root type="single" name="annualRevenue" bind:value={annualRevenue} {disabled}>
				<Select.Trigger class="w-full sm:w-[280px]">
					{annualRevenueOptions.find((o) => o.value === annualRevenue)?.label ||
						'Select annual revenue'}
				</Select.Trigger>
				<Select.Content>
					{#each annualRevenueOptions as option (option.value)}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="space-y-4">
			<h4 class="text-sm font-medium">Headquarters Address</h4>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="addressStreet">Street Address</Label>
					<Input
						id="addressStreet"
						bind:value={addressStreet}
						placeholder="123 Main Street"
						{disabled}
					/>
				</div>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div class="space-y-2">
						<Label for="addressCity">City</Label>
						<Input
							id="addressCity"
							bind:value={addressCity}
							placeholder="San Francisco"
							{disabled}
						/>
					</div>
					<div class="space-y-2">
						<Label for="addressState">State/Province</Label>
						<Input
							id="addressState"
							bind:value={addressState}
							placeholder="CA"
							{disabled}
						/>
					</div>
					<div class="space-y-2">
						<Label for="addressPostalCode">Postal Code</Label>
						<Input
							id="addressPostalCode"
							bind:value={addressPostalCode}
							placeholder="94102"
							{disabled}
						/>
					</div>
					<div class="space-y-2">
						<Label for="addressCountry">Country</Label>
						<Input
							id="addressCountry"
							bind:value={addressCountry}
							placeholder="United States"
							{disabled}
						/>
					</div>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
