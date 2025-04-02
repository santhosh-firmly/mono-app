<script>
	// @ts-nocheck

	import AmexCardIcon from './svg/amex-card-icon.svelte';
	import C2pIcon from './svg/c2p-icon.svelte';
	import DiscoverCardIcon from './svg/discover-card-icon.svelte';
	import MasterCardIcon from './svg/master-card-icon.svelte';
	import VisaCardIcon from './svg/visa-card-icon.svelte';
</script>

<div class="flex flex-row items-center gap-0.5">
	<C2pIcon />
	<div class="mr-1 h-5 w-0.5 bg-black"></div>
	<VisaCardIcon />
	<MasterCardIcon />
	<AmexCardIcon />
	<DiscoverCardIcon />
</div>
