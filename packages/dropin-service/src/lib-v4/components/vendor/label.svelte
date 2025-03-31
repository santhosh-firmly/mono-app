<script lang="ts">
	import classNames from 'classnames';

	export let color: 'gray' | 'disabled' = 'gray';
	export let defaultClass: string = 'text-sm font-medium block';
	export let show: boolean = true;

	let node: HTMLLabelElement;

	const colorClasses = {
		gray: 'text-gray-900 dark:text-gray-300',
		disabled: 'text-gray-400 dark:text-gray-500'
	};

	$: {
		const control: HTMLInputElement = node?.control as HTMLInputElement;
		color = control?.disabled ? 'disabled' : color;
	}

	$: labelClass = classNames(defaultClass, colorClasses[color], $$props.class);
</script>

{#if show}
	<label bind:this={node} {...$$restProps} class={labelClass}><slot /></label>
{:else}
	<slot />
{/if}
