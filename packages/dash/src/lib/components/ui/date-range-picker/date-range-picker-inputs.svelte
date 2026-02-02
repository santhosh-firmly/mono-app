<script>
	import { cn } from '$lib/utils.js';
	import { format, parse, isValid } from 'date-fns';

	let {
		value = { start: null, end: null },
		onChange = () => {},
		granularity = 'day'
	} = $props();

	let dateFormat = $derived(granularity === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm');

	let startInput = $state('');
	let endInput = $state('');
	let startError = $state(false);
	let endError = $state(false);

	$effect(() => {
		startInput = value.start ? format(value.start, dateFormat) : '';
	});

	$effect(() => {
		endInput = value.end ? format(value.end, dateFormat) : '';
	});

	function handleStartChange(event) {
		const inputValue = event.target.value;
		startInput = inputValue;

		if (!inputValue) {
			startError = false;
			onChange({ ...value, start: null });
			return;
		}

		const parsed = parse(inputValue, dateFormat, new Date());
		if (isValid(parsed)) {
			startError = false;
			onChange({ ...value, start: parsed });
		} else {
			startError = true;
		}
	}

	function handleEndChange(event) {
		const inputValue = event.target.value;
		endInput = inputValue;

		if (!inputValue) {
			endError = false;
			onChange({ ...value, end: null });
			return;
		}

		const parsed = parse(inputValue, dateFormat, new Date());
		if (isValid(parsed)) {
			endError = false;
			onChange({ ...value, end: parsed });
		} else {
			endError = true;
		}
	}
</script>

<div class="flex items-center gap-2 border-t px-3 py-2">
	<div class="flex-1">
		<label for="date-range-start" class="mb-1 block text-xs text-muted-foreground">Start</label>
		<input
			id="date-range-start"
			type="text"
			placeholder={dateFormat.toLowerCase()}
			value={startInput}
			class={cn(
				'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				startError && 'border-destructive focus-visible:ring-destructive'
			)}
			oninput={handleStartChange}
		/>
	</div>
	<div class="self-end pb-2 text-muted-foreground">-</div>
	<div class="flex-1">
		<label for="date-range-end" class="mb-1 block text-xs text-muted-foreground">End</label>
		<input
			id="date-range-end"
			type="text"
			placeholder={dateFormat.toLowerCase()}
			value={endInput}
			class={cn(
				'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				endError && 'border-destructive focus-visible:ring-destructive'
			)}
			oninput={handleEndChange}
		/>
	</div>
</div>
