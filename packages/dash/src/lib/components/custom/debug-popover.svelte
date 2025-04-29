<script>
	import CircleHelp from 'lucide-svelte/icons/circle-help';
	import * as Popover from '$lib/components/ui/popover';

	export let objToDebug;
</script>

<Popover.Root>
	<Popover.Trigger><CircleHelp class="h-3 w-3" /></Popover.Trigger>
	<Popover.Content>
		<pre class="text-xs">
        <dl class="grid grid-cols-2">
            {#each Object.entries(objToDebug) as [key, value] (key)}
					<dt
						class="text-right font-semibold">{key}: </dt>
                <dd>{value}</dd>
				{/each}
        </dl>
    </pre>
	</Popover.Content>
</Popover.Root>
