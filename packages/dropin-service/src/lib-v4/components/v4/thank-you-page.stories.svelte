<script>
	// @ts-nocheck
	import ThankYouPage from './thank-you-page.svelte';
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import './theme.css';
	import order from './data/order.json';
	import paypalOrder from './data/paypal-order.json';
	import { isPrimaryDark } from './theme-context';

	const merchantName = 'Merchant Name';
	const merchantInfo = {
		smallLogo: '',
		largeLogo:
			'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHZlcnNpb249IjEuMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjcwIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMTU5IDI2IiByb2xlPSJpbWciPgoJPHBhdGgKCQlmaWxsPSIjNTQxMjQ3IgoJCWQ9Ik04MC41NzUgMTMuMTY4aC0yLjgxMVYuODhoMi4zMDhjNC42MTQgMCA2LjMzNSAxLjYzNSA2LjMzNSA2LjU4MyAwIDQuMTEtMS43NjQgNS43MDQtNS44MzIgNS43MDR6bTguNDA4IDcuNzU0bC01LjIyMi03Ljc1NGMzLjY0OC0xLjA0OSA2LjAzOS0zLjEwMyA2LjAzOS02LjQ1OSAwLTQuMDY3LTMuNDgtNi4yOS05LjcyOC02LjI5aC01LjM2NnYyNS4xNjJoMy4wNThWMTMuNjI5aDIuODEzTDg2LjcgMjIuOThjMS4zMzUgMi4wNCAyLjMwNiAyLjY4NSAzLjk4NCAyLjY4NWgyLjIxOXYtLjEyNmMtMS4yNTgtLjgzOC0xLjk0Ny0xLjY4Ni0zLjkyLTQuNjE3em00MS43ODkuNzA2TDEyMS41NzMuNDE5aC0zLjk1OHYuMTI4Yy44NzcuNzk4IDEuNzIyIDIuMzMyIDIuNDc0IDMuOTg2djIxLjEzMmguNTQ2VjUuNzkxTDEyOS40MDEgMjZoLjMzNGw4LjY0LTIzLjAxM3YyMi41OTNoMy4wNThWLjQxOWgtMi42ODNsLTcuOTc4IDIxLjIwOXptLTI4LjE3IDMuNDA4aC0zLjYwOFYxMi45NTdjMi4yNjQgMCA1LjA3OC4wODQgOS43NzUuNDYxdi0xLjQ2NmMtNC42OTcuMzc3LTcuNTExLjQ2MS05Ljc3NS40NjFWLjk2NWgzLjI3MmMxLjQ2OCAwIDQuNzUuMjA5IDcuNjg1IDEuMjk5aC4wNDJMMTA5Ljk0LjQxOUg5NS45MzZ2MjUuMTYyaDE0LjM4MmwuMjE3LTIuMDk3aC0uMDQyYy0zLjQzOSAxLjMxNi02LjM4MiAxLjU1Mi03Ljg5IDEuNTUyem01OC43MTItMS41NTJjLTMuNDM4IDEuMzE2LTYuMzggMS41NTItNy44OSAxLjU1MmgtMy42MDlWMTIuOTU3YzIuMjY1IDAgNS4wNzkuMDg0IDkuNzc2LjQ2MXYtMS40NjZjLTQuNjk3LjM3Ny03LjUxMS40NjEtOS43NzYuNDYxVi45NjVoMy4yNzNjMS40NjcgMCA0Ljc1LjIwOSA3LjY4NSAxLjI5OWguMDQybC0uMDUzLTEuODQ1aC0xNC4wMDV2MjUuMTYyaDE0LjM4M2wuMjE2LTIuMDk3aC0uMDQyek01OS40MTcgMjUuNTRjLTYuNzkzIDAtNy41NS02LjMzMy03LjU1LTEyLjU0IDAtNi4yMDUuNzU3LTEyLjUzOCA3LjU1LTEyLjUzOCA2Ljc5NCAwIDcuNTUgNi4zMzMgNy41NSAxMi41MzkgMCA2LjIwNi0uNzU2IDEyLjUzOS03LjU1IDEyLjUzOXptMC0yNS41MzljLTYuNjI1IDAtMTAuOTQzIDUuNDkzLTEwLjk0MyAxMyAwIDcuNTA2IDQuMzE4IDEzIDEwLjk0MyAxMyA2LjYyNiAwIDEwLjk0NC01LjQ5NCAxMC45NDQtMTMgMC03LjUwNy00LjMxOC0xMy0xMC45NDQtMTN6TTMyLjk1IDI1LjA3OGgtMy45ODVWLjkyM2gyLjM5MmM4LjkzMyAwIDEwLjMxOCA1LjE1OCAxMC4zMTggMTEuNzQxIDAgNi44NzgtMS4zNDMgMTIuNDE0LTguNzI1IDEyLjQxNHpNMzEuNjkyLjQxOWgtNS43ODZ2MjUuMTYyaDcuMDAyYzcuNjc0IDAgMTIuMTYtNS43MDMgMTIuMTYtMTMuMDQzQzQ1LjA2NyA1LjI0MiA0MC44MzMuNDIgMzEuNjkxLjQyek00Ljc2MyAxNS45ODNMOS44OTggNC4xMjVsNS4xNDYgMTEuODU4SDQuNzY0ek03LjYwNS40MTl2LjEyOGMuODQxLjc0MyAxLjUwOCAxLjkyNCAxLjk3NyAyLjg5NkwwIDI1LjU4MWguNjA3bDMuOTEtOS4wMzJIMTUuMjlsMy45MTggOS4wMzJoMy4yNjVMMTEuNTYzLjQxOUg3LjYwNHoiCgk+PC9wYXRoPgo8L3N2Zz4=',
		displayName: 'displayName'
	};

	function setDarkTheme() {
		isPrimaryDark.set(true);
	}

	function setLightTheme() {
		isPrimaryDark.set(false);
	}
</script>

<Meta
	title="Checkout V4/Common/Thank You Page"
	component={ThankYouPage}
	tags={['autodocs']}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Story
	name="Thank You Page Light Theme"
	args={{
		order,
		merchantInfo,
		merchantName
	}}
>
	<div class="theme-provider" use:setLightTheme>
		<ThankYouPage {order} {merchantInfo} {merchantName} />
	</div>
</Story>

<Story name="Thank You Page Dark Theme">
	<div class="theme-provider adoreme-dark" use:setDarkTheme>
		<ThankYouPage {order} {merchantInfo} {merchantName} />
	</div>
</Story>

<Story name="Thank You Page Adore Me Light">
	<div class="theme-provider adoreme-light" use:setLightTheme>
		<ThankYouPage {order} {merchantInfo} {merchantName} />
	</div>
</Story>

<Story name="Thank You Page Red">
	<div class="theme-provider red" use:setDarkTheme>
		<ThankYouPage {order} {merchantInfo} {merchantName} />
	</div>
</Story>

<Story name="Thank You Page White">
	<div class="theme-provider">
		<ThankYouPage {order} {merchantInfo} {merchantName} />
	</div>
</Story>

<Story name="Thank You Page PayPal">
	<div class="theme-provider adoreme-dark" use:setDarkTheme>
		<ThankYouPage order={paypalOrder} {merchantInfo} {merchantName} />
	</div>
</Story>
