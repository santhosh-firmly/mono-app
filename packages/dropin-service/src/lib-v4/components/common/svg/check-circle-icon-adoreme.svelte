<script>
	export let width = 24;
	export let height = 24;
	export let active = false;
	let classList = '';

	$: {
		if (active) {
			classList = 'bg-[#813571] rounded-full p-1 stroke-2 stroke-[#fff]';
		} else {
			classList = 'bg-[#dcdce5] rounded-full p-1 mx-[6px] w-[12px] h-[12px] stroke-2';
		}
	}
</script>

<svg
	{...$$restProps}
	{width}
	{height}
	class="{classList} {$$props.class}"
	focusable="false"
	aria-hidden="true"
	viewBox="0 0 20 20"
	><path fill="none" d="m1.5 11.034 6.675 6.087L18.5 2.879" clip-rule="evenodd"></path></svg
>
