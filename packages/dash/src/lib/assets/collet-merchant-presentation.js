import merchants from './merchants-data.json' assert { type: 'json' };

function collect(merchants) {
	const mapped = merchants
		.filter((merchant) => {
			// Keep merchant in array if at least one of these fields exists and isn't empty
			return (
				(merchant.brand_color !== undefined && merchant.brand_color !== '') ||
				(merchant.action_color !== undefined && merchant.action_color !== '') ||
				(merchant.edge_large_logo !== undefined && merchant.edge_large_logo !== '') ||
				(merchant.logo_url !== undefined && merchant.logo_url !== '') ||
				(merchant.logo_svg !== undefined && merchant.logo_svg !== '')
			);
		})
		.map((merchant) => ({
			store_id: merchant.store_id,
			theme: {
				colors: {
					primary: merchant.brand_color || '',
					action: merchant.action_color || ''
				},
				largeLogo: merchant.edge_large_logo || merchant.logo_url || merchant.logo_svg || ''
			}
		}));

	console.log(JSON.stringify(mapped));
}

collect(merchants.merchants);
