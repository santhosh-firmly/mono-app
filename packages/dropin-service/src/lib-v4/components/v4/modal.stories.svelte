<script>
	// @ts-ignore
	import Modal from './modal.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import BaseLogin from './base-login.svelte';
</script>

<Meta title="Checkout V4/Common/Modal" component={Modal} tags={['autodocs']} />

<Template let:args>
	<div class="adoreme-dark">
		<Modal {...args} />
	</div>
</Template>

<Story
	name="Base Login"
	args={{
		isModalOpen: true,
		modalFlow: BaseLogin
	}}
/>
