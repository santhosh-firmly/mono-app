<script>
	// @ts-nocheck

	import Group from './group.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.scss';
</script>

<Meta title="Checkout V4/Common/Group" component={Group} tags={['autodocs']} />

<Template>
	<Group />
</Template>

<Story name="Single Element">
	<Group>
		<span class="col-span-2 p-3">First Element</span>
	</Group>
</Story>
<Story name="Multiple Elements">
	<Group>
		<span class="col-span-2 p-3">First Element</span>
		<span class="col-span-2 p-3">Second Element</span>
	</Group>
</Story>
<Story name="Multiple Element Sizes">
	<Group>
		<span class="col-span-2 p-3">First Element</span>
		<span class="p-3">Second Element</span>
		<span class="p-3">Third Element</span>
	</Group>
</Story>
<Story name="Complex Construction">
	<Group>
		<span class="col-span-2 p-3">First Element</span>
		<span class="p-3">Second Element</span>
		<span class="p-3">Third Element</span>
		<span class="col-span-2 p-3">Forth Element</span>
	</Group>
</Story>
<Story name="Radio Example">
	<Group>
		<div class="col-span-2 flex flex-row items-center">
			<input id="radio1" type="radio" class="my-4 mx-3" />
			<span for="radio1"> First Element </span>
		</div>
		<div class="col-span-2 flex flex-row items-center">
			<input id="radio1" type="radio" class="my-4 mx-3" />
			<span for="radio1"> Second Element </span>
		</div>
	</Group>
</Story>
