<script>
    import Chart from './chart.svelte';
    import { echarts } from './chart.svelte';

    export const initialTime = new Date('2023-07-03');
    export const finalTime = new Date('2023-07-04');
    export const aggregationInMinutes = 5;

    const originalData = {
        '2023-07-03 13:40:00': 2,
        '2023-07-03 16:00:00': 3,
        '2023-07-03 16:10:00': 20,
        '2023-07-03 16:15:00': 53,
        '2023-07-03 16:20:00': 24,
        '2023-07-03 16:25:00': 26,
        '2023-07-03 16:30:00': 29,
        '2023-07-03 16:35:00': 8,
        '2023-07-03 16:40:00': 11,
        '2023-07-03 16:45:00': 20,
        '2023-07-03 16:50:00': 14,
        '2023-07-03 16:55:00': 4,
        '2023-07-03 17:00:00': 7,
        '2023-07-03 17:05:00': 5,
        '2023-07-03 17:10:00': 12,
        '2023-07-03 17:15:00': 2,
        '2023-07-03 17:20:00': 7,
        '2023-07-03 17:25:00': 7,
        '2023-07-03 17:30:00': 10,
        '2023-07-03 17:35:00': 15,
        '2023-07-03 17:40:00': 7,
        '2023-07-03 17:45:00': 3,
        '2023-07-03 17:50:00': 9,
        '2023-07-03 17:55:00': 4,
        '2023-07-03 18:00:00': 2,
        '2023-07-03 18:05:00': 3,
        '2023-07-03 18:10:00': 1,
        '2023-07-03 18:20:00': 6,
        '2023-07-03 18:25:00': 10,
        '2023-07-03 18:30:00': 3,
        '2023-07-03 18:45:00': 4,
        '2023-07-03 18:55:00': 2,
        '2023-07-03 19:00:00': 4,
        '2023-07-03 19:05:00': 1,
        '2023-07-03 19:10:00': 4,
        '2023-07-03 19:15:00': 3,
        '2023-07-03 19:30:00': 5,
        '2023-07-03 19:35:00': 2,
        '2023-07-03 19:45:00': 2,
        '2023-07-03 19:55:00': 1,
        '2023-07-03 20:00:00': 1,
        '2023-07-03 20:05:00': 1,
        '2023-07-03 20:10:00': 10,
        '2023-07-03 20:15:00': 4,
        '2023-07-03 20:20:00': 2,
        '2023-07-03 20:25:00': 1,
        '2023-07-03 20:30:00': 1,
        '2023-07-03 20:35:00': 1,
        '2023-07-03 20:40:00': 4,
        '2023-07-03 20:50:00': 1,
        '2023-07-03 21:25:00': 7,
        '2023-07-03 21:55:00': 3,
        '2023-07-03 22:10:00': 1,
        '2023-07-03 22:30:00': 1,
        '2023-07-03 22:50:00': 6,
        '2023-07-03 23:05:00': 3,
        '2023-07-03 23:10:00': 11,
        '2023-07-03 23:45:00': 1,
        '2023-07-03 23:50:00': 1,
        '2023-07-03 23:55:00': 4,
    };

    let dates = [];
    let data = [];
    let base = initialTime.getTime();
    const step = aggregationInMinutes * 60000; // 1 minute in milliseconds
    while (base < finalTime.getTime()) {
        const now = new Date(base);
        dates.push(now.toISOString());
        const key = `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-${(now.getUTCDay() + 2)
            .toString()
            .padStart(2, '0')} ${now.getUTCHours()}:${now.getUTCMinutes()}:00`;
        // console.log('key', now.toISOString(), key);
        data.push(originalData[key] ?? 0);
        base = base + step;
    }

    const options = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            },
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                name: 'Fake Data',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: 'rgb(255, 70, 131)',
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(255, 158, 68)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 70, 131)',
                        },
                    ]),
                },
                data: data,
            },
        ],
    };
</script>

<div class="chart">
    <Chart {options} />
</div>

<style>
    .chart {
        height: 500px;
        width: 100%;
    }
</style>
