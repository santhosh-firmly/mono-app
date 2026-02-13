<script>
	import * as Select from '$lib/components/ui/select/index.js';
	import Globe from 'lucide-svelte/icons/globe';

	let { value = Intl.DateTimeFormat().resolvedOptions().timeZone, onChange = () => {} } =
		$props();

	const timezoneGroups = [
		{
			label: 'America',
			timezones: [
				'America/New_York',
				'America/Chicago',
				'America/Denver',
				'America/Los_Angeles',
				'America/Phoenix',
				'America/Anchorage',
				'America/Sao_Paulo',
				'America/Mexico_City'
			]
		},
		{
			label: 'Europe',
			timezones: [
				'Europe/London',
				'Europe/Paris',
				'Europe/Berlin',
				'Europe/Madrid',
				'Europe/Rome',
				'Europe/Amsterdam',
				'Europe/Lisbon',
				'Europe/Moscow'
			]
		},
		{
			label: 'Asia',
			timezones: [
				'Asia/Tokyo',
				'Asia/Shanghai',
				'Asia/Hong_Kong',
				'Asia/Singapore',
				'Asia/Seoul',
				'Asia/Dubai',
				'Asia/Kolkata',
				'Asia/Bangkok'
			]
		},
		{
			label: 'Pacific',
			timezones: [
				'Pacific/Honolulu',
				'Pacific/Auckland',
				'Australia/Sydney',
				'Australia/Melbourne',
				'Australia/Perth'
			]
		},
		{
			label: 'Other',
			timezones: ['UTC']
		}
	];

	function formatTimezone(tz) {
		return tz.replace(/_/g, ' ').replace(/\//g, ' / ');
	}

	function handleValueChange(newValue) {
		if (newValue) {
			onChange(newValue);
		}
	}
</script>

<div class="flex items-center gap-2">
	<Globe class="h-4 w-4 text-muted-foreground" />
	<Select.Root type="single" {value} onValueChange={handleValueChange}>
		<Select.Trigger class="h-8 w-[180px] text-xs">
			<Select.Value placeholder="Select timezone">
				{formatTimezone(value)}
			</Select.Value>
		</Select.Trigger>
		<Select.Content class="max-h-[300px] overflow-y-auto">
			{#each timezoneGroups as group}
				<Select.Group>
					<Select.Label class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
						{group.label}
					</Select.Label>
					{#each group.timezones as tz}
						<Select.Item value={tz} label={formatTimezone(tz)} class="text-xs">
							{formatTimezone(tz)}
						</Select.Item>
					{/each}
				</Select.Group>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
