<script>
    import classNames from 'classnames';

    /**
     * @property {string} helperClass - Helper class
     * @property {'gray' | 'green' | 'red' | 'disabled'} color - Color
     * @property {Snippet} children - Children content snippet
     * @property {string} class - Additional classes
     */
    let { helperClass = 'text-xs font-normal text-gray-500 dark:text-gray-300', color = 'gray', children, class: className = '' } = $props();
    const colorClasses = {
        gray: 'text-gray-900 dark:text-gray-300',
        //green: 'text-green-700 dark:text-green-500',
        red: 'text-red-700 dark:text-red-500',
        disabled: 'text-gray-400 dark:text-gray-500',
    };
</script>

<p class={classNames(helperClass, colorClasses[color], className)}>
    {@render children?.()}
</p>
