<script>
    import Box from '../layouts/Box.svelte';
    import LineChart from '../charts/line-chart.svelte';
    import PieChart from '../charts/pie-chart.svelte';
    import Select from '../components/select.svelte';
    import TimeSelect from '../components/time-select.svelte';
    import { writable } from 'svelte/store';
    
    export const timeSelection = writable();
</script>

<div class="w-full h-min grid grid-cols-12 gap-2 m-2">
    <div class="col-span-12 flex flex-row">
        <Select />

        <!-- Separator -->
        <div class="grow" />

        <TimeSelect />
    </div>
    <Box class="col-span-12 lg:col-span-8">
        <p class="text-xl font-bold mx-auto text-center">Visits Over Time</p>
        <LineChart />
    </Box>

    <Box class="col-span-12 md:col-span-8 lg:col-span-4">
        <p class="text-xl font-bold mx-auto text-center">Top Sources</p>
        <PieChart />
    </Box>
</div>
