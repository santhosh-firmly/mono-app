<script context="module">
    import * as echarts from 'echarts';

    export { echarts };

    const DEFAULT_OPTIONS = {
        theme: undefined,
        renderer: 'canvas',
    };

    export function chartable(element, echartOptions) {
        const { theme, renderer, options } = {
            ...DEFAULT_OPTIONS,
            ...echartOptions,
        };

        const echartsInstance = echarts.init(element, theme, { renderer });
        echartsInstance.setOption(options);

        function handleResize() {
            echartsInstance.resize();
        }

        window.addEventListener('resize', handleResize);

        return {
            destroy() {
                echartsInstance.dispose();
                window.removeEventListener('resize', handleResize);
            },
            update(newOptions) {
                echartsInstance.setOption({
                    ...echartOptions.options,
                    ...newOptions.options,
                });
            },
        };
    }
</script>

<script>
    export let options;
    export let { theme, renderer } = DEFAULT_OPTIONS;
</script>

<div class="chart" use:chartable={{ renderer, theme, options }} />

<style>
    .chart {
        height: 100%;
        width: 100%;
    }
</style>
