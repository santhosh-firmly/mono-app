<script>
	import { FooterLine1, FooterLine2 } from '$lib/browser/localization.js';
	import AmexCardIcon from '../common/svg/amex-card-icon.svelte';
	import DiscoverCardIcon from '../common/svg/discover-card-icon.svelte';
	import MasterCardIcon from '../common/svg/master-card-icon.svelte';
	import VisaCardIcon from '../common/svg/visa-card-icon.svelte';
	let height = 32;
	let width = 32;
</script>

<div id="footer" class="mt-2 mb-2">
	<div class="flex flex-row justify-center text-xs text-secondary gap-2 divide-x divide-solid">
		<div class="flex flex-col justify-center basis-1/2">
			<div class="flex flex-row leading-5 gap-2 justify-end">
				<span class="aspect-auto">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-5 h-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
						/>
					</svg>
				</span>
				<span>{FooterLine1}</span>
			</div>
			<div class="flex flex-row justify-end">
				{FooterLine2}
			</div>
		</div>
		<div class="flex justify-start content-center basis-1/2 flex-wrap gap-2">
			<VisaCardIcon {width} {height} class="ml-1" />
			<MasterCardIcon {width} {height} />
			<AmexCardIcon {width} {height} />
			<DiscoverCardIcon {width} {height} />
		</div>
	</div>
</div>
