<script>
	import SingleFlowView from '$lib/views/single-flow.svelte';
	import MOCKED_CART from '../stories/assets/cart.json';

	const MOCKED_STORE_INFO = {
		logoUrl:
			"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg id='liv-logo' data-name='Layer 2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 737.78 122.51'%3E%3Cg%3E%3Cg%3E%3Cpolygon style='stroke-width:0px;fill:%23004e72;' points='168.94 93.65 168.94 9.71 146.69 9.71 146.69 114.77 209.78 114.77 209.78 93.65 168.94 93.65'/%3E%3Crect style='stroke-width:0px;fill:%23004e72;' x='223.12' y='9.71' width='22.14' height='105.06'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M413.15,9.82v67.51c0,6.82-2.05,18.26-15.76,18.26-10.89,0-16.89-6.48-16.89-18.26V9.82h-22.14v67.51c0,12.26,4.04,22.43,11.68,29.41,6.86,6.27,16.54,9.73,27.24,9.73,23.45,0,38.01-15,38.01-39.15V9.82h-22.14Z'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M338.76,93.7l-1.01-.7c2.68-5.82,4.18-12.45,4.18-19.61v-24.3c0-24.54-17.45-43.05-40.6-43.05s-40.6,18.51-40.6,43.05v24.3c0,24.54,17.45,43.05,40.6,43.05,7.17,0,13.8-1.78,19.53-4.97-.47-.36-.93-.68-1.4-1.06-6.04-4.86-13.15-10.05-21.06-10.05v-6.12c-10.75-1.55-15.69-11.51-15.69-20.84v-24.3c0-10.15,5.83-21.07,18.63-21.07s18.63,10.92,18.63,21.07v24.3c0,2.25-.29,4.54-.88,6.74-.74-.47-1.43-.88-2.05-1.21-5.65-3-10.99-4.78-18.42-4.78v19.94c9.1,0,16.83,5.6,23.36,10.86,9.12,7.33,17.22,10.6,26.26,10.6h2.88v-19.42c-6.13,0-9.67-1.05-12.35-2.43Z'/%3E%3Crect style='stroke-width:0px;fill:%23004e72;' x='449.39' y='9.71' width='22.14' height='105.06'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M566.38,70.69h0c0-.46-.02-19.3-.04-19.76-.92-20.74-14.51-41.22-43.3-41.22h-34.83v105.06h34.83c12.82,0,23.67-4.15,31.39-12,7.51-7.64,11.83-18.75,11.96-30.67,0-.47,0-.94,0-1.41ZM523.04,93.09h-12.7V31.16h12.7c14.58,0,21.14,10.09,21.14,19.93,0,.42.05,19.22.06,19.64,0,.35.01.69.01,1.03,0,7.25-2.07,11.85-5.75,15.63-3.68,3.78-8.88,5.7-15.46,5.7Z'/%3E%3Crect style='stroke-width:0px;fill:%23004e72;' x='593.14' y='9.71' width='22.14' height='105.06'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M637.48,92.27c-7.75,0-11.81,5.9-11.81,11.72s4.06,11.72,11.81,11.72,11.81-5.9,11.81-11.72-4.06-11.72-11.81-11.72Z'/%3E%3Cpolygon style='stroke-width:0px;fill:%23004e72;' points='697.38 9.71 675.83 83.49 654.38 9.71 629.65 9.71 665.68 115.11 686.08 115.11 722.11 9.71 697.38 9.71'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M713.23,92.27c-7.75,0-11.81,5.9-11.81,11.72s4.06,11.72,11.81,11.72,11.81-5.9,11.81-11.72-4.06-11.72-11.81-11.72Z'/%3E%3C/g%3E%3Cg%3E%3Cpath style='stroke-width:0px;fill:%23fff' d='M34.18,69.07c0-1.05.1-2.1.26-3.12.37-2.16,1.1-4.28,2.21-6.27.22-.38.45-.77.7-1.15l.03-.07s.02-.05.04-.07l7.43-13.05,1.59-2.77,6.95-12.01,6.94,12.01,1.58,2.77,7.42,13.05s.04.05.05.07l.04.07c.24.38.47.77.68,1.15,1.12,1.99,1.87,4.1,2.22,6.27.17,1.02.28,2.07.28,3.12,0,10.59-8.62,19.21-19.21,19.21-10.6,0-19.21-8.63-19.21-19.21Z'/%3E%3Cg%3E%3Cpath style='stroke-width:0px;fill:%230075c8;' d='M34.25,69.03c0-1.05.1-2.1.27-3.13.37-2.17,1.1-4.29,2.22-6.28.22-.39.45-.77.7-1.15l.03-.07s.02-.05.04-.07l7.44-13.08,1.59-2.78,6.87-11.88V0c-.44,0-.89.1-1.22.29L1.22,29.71C.54,30.1,0,31.05,0,31.84v58.84c0,.77.54,1.73,1.22,2.12l50.97,29.42c.33.2.75.29,1.21.29v-34.23c-10.57-.06-19.14-8.68-19.14-19.25Z'/%3E%3Cpath style='stroke-width:0px;fill:%2300a7e1' d='M105.59,29.71L54.62.29c-.32-.2-.77-.29-1.21-.29v30.61s.09-.16.09-.16l6.95,12.04,1.58,2.78,7.44,13.08s.04.04.05.07l.04.07c.24.38.47.77.68,1.15,1.13,1.99,1.87,4.11,2.22,6.28.17,1.02.28,2.07.28,3.13,0,10.61-8.64,19.24-19.24,19.25-.03,0-.07,0-.1,0v34.23c.44,0,.89-.09,1.23-.29l50.97-29.42c.68-.39,1.23-1.35,1.23-2.12V31.84c0-.78-.55-1.74-1.23-2.13Z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M737.78,18.25c0,2.61-2.07,4.67-4.72,4.67s-4.67-2.02-4.67-4.63,2.07-4.67,4.72-4.67,4.67,2.02,4.67,4.63ZM736.85,18.27c0-2.2-1.62-3.79-3.77-3.79s-3.77,1.59-3.77,3.79,1.62,3.77,3.77,3.77,3.77-1.57,3.77-3.77ZM731.41,16.01h2c.93,0,1.62.56,1.62,1.46,0,.69-.41,1.18-1.03,1.38l1.23,1.68h-1.03l-1.12-1.59h-.8v1.59h-.86v-4.52ZM732.27,16.74v1.49h1.03c.56,0,.88-.28.88-.73s-.32-.75-.88-.75h-1.03Z'/%3E%3C/svg%3E"
	};

	const MOCKED_STORAGE = {
		credit_cards: [
			{
				id: 1,
				brand: 'Visa',
				first4: '4111',
				last4: '1234'
			},
			{
				id: 2,
				brand: 'Mastercard',
				first4: '5111',
				last4: '5678'
			},
			{
				id: 3,
				brand: 'American Express',
				first4: '3411',
				last4: '9012'
			}
		],
		shipping_addresses: [
			{
				id: 1,
				first_name: 'John',
				last_name: 'Smith',
				phone: '2065550123',
				address1: '123 Main Street',
				city: 'Seattle',
				state_or_province: 'WA',
				state_name: 'Washington',
				country: 'United States',
				postal_code: '98101',
				email: 'john.smith@example.com'
			},
			{
				id: 2,
				first_name: 'Sarah',
				last_name: 'Johnson',
				phone: '5035551234',
				address1: '456 Park Avenue',
				city: 'Portland',
				state_or_province: 'OR',
				state_name: 'Oregon',
				country: 'United States',
				postal_code: '97201',
				email: 'sarah.j@example.com'
			},
			{
				id: 3,
				first_name: 'Michael',
				last_name: 'Brown',
				phone: '4155559876',
				address1: '789 Ocean Drive',
				city: 'San Francisco',
				state_or_province: 'CA',
				state_name: 'California',
				country: 'United States',
				postal_code: '94105',
				email: 'm.brown@example.com'
			}
		]
	};

	const MOCKED_ADDRESS_COMPLETIONS = [
		{
			id: 1,
			value: '1 Microsoft Way'
		},
		{
			id: 2,
			value: '123 Main Street'
		},
		{
			id: 3,
			value: '456 Park Avenue'
		},
		{
			id: 4,
			value: '789 Ocean Drive'
		}
	];

	const MOCKED_ADDRESS_COMPLETIONS_FULL = [
		{
			id: 1,
			address1: '789 Ocean Drive',
			city: 'San Francisco',
			state_or_province: 'CA',
			state_name: 'California',
			country: 'United States',
			postal_code: '94105'
		},
		{
			id: 2,
			address1: '123 Main Street',
			city: 'Seattle',
			state_or_province: 'WA',
			state_name: 'Washington',
			country: 'United States',
			postal_code: '98101'
		},
		{
			id: 3,
			address1: '456 Park Avenue',
			city: 'Portland',
			state_or_province: 'OR',
			state_name: 'Oregon',
			country: 'United States',
			postal_code: '97201'
		},
		{
			id: 4,
			address1: '1 Microsoft Way',
			city: 'Redmond',
			state_or_province: 'WA',
			state_name: 'Washington',
			country: 'United States',
			postal_code: '98052'
		}
	];

	// Using Svelte 5's $state instead of let $state
	const state = $state({
		activeFlow: 'default', // Controls which flow to show
		dataWithoutShippingMethod: {
			pending: {},
			cart: {
				...MOCKED_CART,
				shipping_info: undefined,
				shipping_method: undefined,
				shipping_method_options: []
			},
			store: MOCKED_STORE_INFO,
			storage: MOCKED_STORAGE,
			autocomplete: {
				completions: MOCKED_ADDRESS_COMPLETIONS,
				selectedAddress: undefined
			}
		},
		preFilledData: {
			pending: {},
			cart: MOCKED_CART,
			store: MOCKED_STORE_INFO,
			autocomplete: {
				completions: MOCKED_ADDRESS_COMPLETIONS,
				selectedAddress: undefined
			}
		},
		data: {
			pending: {},
			cart: MOCKED_CART,
			store: MOCKED_STORE_INFO,
			storage: MOCKED_STORAGE,
			autocomplete: {
				completions: MOCKED_ADDRESS_COMPLETIONS,
				selectedAddress: undefined
			}
		},
		loadingData: {
			pending: { cart: true }
		}
	});

	function handleDispatch(data, action, payload) {
		console.log(action, payload);

		data.pending[action] = true;

		setTimeout(
			() => {
				data.pending[action] = false;

				switch (action) {
					case 'set_shipping_address':
						data.cart.shipping_info = payload;
						break;
					case 'add_promo_code':
						if (!data.cart.promo_codes) {
							data.cart.promo_codes = [];
						}
						data.cart.promo_codes.push(payload);
						break;
					case 'update_shipping_method':
						data.cart.shipping_method = payload;
						break;
					case 'remove_all_codes':
						data.cart.promo_codes = [];
						break;
					case 'input_shipping_address_completion':
						data.autocomplete.shippingCompletions = MOCKED_ADDRESS_COMPLETIONS.filter((address) =>
							address.value.toLowerCase().includes(payload.toLowerCase())
						);
						break;
					case 'select_shipping_address_completion':
						data.autocomplete.shippingAddress = MOCKED_ADDRESS_COMPLETIONS_FULL.find(
							(address) => address.id === payload.id
						);
						break;
					case 'input_billing_address_completion':
						data.autocomplete.billingCompletions = MOCKED_ADDRESS_COMPLETIONS.filter((address) =>
							address.value.toLowerCase().includes(payload.toLowerCase())
						);
						break;
					case 'select_billing_address_completion':
						data.autocomplete.billingAddress = MOCKED_ADDRESS_COMPLETIONS_FULL.find(
							(address) => address.id === payload.id
						);
						break;
					default:
						break;
				}
			},

			Math.floor(Math.random() * 4000) + 1000
		);
	}
</script>

<div class="flow-selector">
	<button
		class:active={state.activeFlow === 'loading'}
		onclick={() => (state.activeFlow = 'loading')}
	>
		Loading State
	</button>
	<button
		class:active={state.activeFlow === 'default'}
		onclick={() => (state.activeFlow = 'default')}
	>
		Default Flow
	</button>
	<button
		class:active={state.activeFlow === 'prefilled'}
		onclick={() => (state.activeFlow = 'prefilled')}
	>
		Pre-filled Flow
	</button>
	<button
		class:active={state.activeFlow === 'saved-address'}
		onclick={() => (state.activeFlow = 'saved-address')}
	>
		Saved Address
	</button>
	<button
		class:active={state.activeFlow === 'saved-all'}
		onclick={() => (state.activeFlow = 'saved-all')}
	>
		Saved All
	</button>
</div>

{#if state.activeFlow === 'loading'}
	<SingleFlowView
		data={state.loadingData}
		dispatch={(action, payload) => handleDispatch(state.dataWithoutShippingMethod, action, payload)}
	/>
{:else if state.activeFlow === 'default'}
	<SingleFlowView
		data={state.dataWithoutShippingMethod}
		dispatch={(action, payload) => handleDispatch(state.dataWithoutShippingMethod, action, payload)}
	/>
{:else if state.activeFlow === 'prefilled'}
	<SingleFlowView
		data={state.preFilledData}
		dispatch={(action, payload) => handleDispatch(state.preFilledData, action, payload)}
	/>
{:else if state.activeFlow === 'saved-address' || state.activeFlow === 'saved-all'}
	<SingleFlowView
		data={state.data}
		dispatch={(action, payload) => handleDispatch(state.data, action, payload)}
	/>
{/if}

<style>
	.flow-selector {
		position: fixed;
		top: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 1000;
	}

	button {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
		cursor: pointer;
	}

	button.active {
		background: #004e72;
		color: white;
	}
</style>
