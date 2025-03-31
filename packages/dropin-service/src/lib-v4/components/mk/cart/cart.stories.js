import { CartHive } from '$lib-v4/sdk/cart-hive.js';
import Cart from './cart.svelte';

export default {
	title: 'Dynamo/Cart',
	component: Cart,
	tags: ['autodocs']
};

export const FirmlyAICartData = {
	display_name: 'Firmly Test Store',
	cart_status: 'active',
	platform_id: 'shopify',
	shop_id: 'firmlyai.myshopify.com',
	cart_id: '787b8cfd-da50-4945-a994-c71039c5c148',
	urls: {},
	line_items: [
		{
			domain: 'firmlyai.myshopify.com',
			readOnly: false,
			line_item_id: 'c1dba23b-43ea-4d1b-adf4-33b1e0af2aa9',
			sku: '43624719843576',
			base_sku: '7921742577912',
			quantity: 1,
			msrp: {
				currency: 'USD',
				value: 2
			},
			price: {
				currency: 'USD',
				value: 2
			},
			line_price: {
				currency: 'USD',
				value: 2
			},
			requires_shipping: true,
			image: {
				url: 'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_large.jpg?v=1674229252',
				large:
					'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_large.jpg?v=1674229252',
				grande:
					'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_grande.jpg?v=1674229252',
				medium:
					'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_medium.jpg?v=1674229252',
				compact:
					'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_compact.jpg?v=1674229252',
				small:
					'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_small.jpg?v=1674229252'
			},
			platform_line_item_id: 'fe7af4766bd088cb8ab57af8cf6a209f',
			description: 'Cheapest Car in the world',
			variant_description: 'Cheapest Car in the world'
		}
	],
	sub_total: {
		currency: 'USD',
		value: 2
	},
	cart_discount: {
		currency: 'USD',
		value: 0
	},
	shipping_total: {
		currency: 'USD',
		value: 0
	},
	tax: {
		currency: 'USD',
		value: 0
	},
	total: {
		currency: 'USD',
		value: 2
	},
	payment_method_options: [
		{
			type: 'CreditCard',
			wallet: 'user'
		},
		{
			type: 'PayPal',
			wallet: 'paypal'
		},
		{
			type: 'ShopPay',
			wallet: 'shoppay'
		}
	]
};

export const MagentoCartData = {
	display_name: 'Magento Demo',
	cart_status: 'active',
	platform_id: 'magento',
	shop_id: 'magento-898055-3117720.cloudwaysapps.com',
	cart_id: 'a85832af-d81c-4000-8796-52d6c5222a04',
	urls: {},
	line_items: [
		{
			domain: 'magento-898055-3117720.cloudwaysapps.com',
			readOnly: false,
			line_item_id: 'a1b2040a-e298-423b-8fcf-3b9004953b3f',
			sku: 'Santos-Jersey',
			base_sku: 'Santos-Jersey',
			quantity: 1,
			requires_shipping: true,
			image: {
				url: 'https://magento-898055-3117720.cloudwaysapps.com/media/catalog/product/s/a/santos-22-23-kits-3.jpg'
			},
			msrp: {
				currency: 'USD',
				value: 0.8
			},
			price: {
				currency: 'USD',
				value: 0.8
			},
			line_price: {
				currency: 'USD',
				value: 0.8
			},
			platform_line_item_id: '0',
			description: 'Santos Jersey'
		}
	],
	total: {
		currency: 'USD',
		value: 0.8
	},
	sub_total: {
		currency: 'USD',
		value: 0.8
	},
	shipping_total: {
		currency: 'USD',
		value: 0
	},
	tax: {
		currency: 'USD',
		value: 0
	},
	cart_discount: {
		currency: 'USD',
		value: 0
	},
	payment_method_options: [
		{
			type: 'CreditCard',
			wallet: 'user'
		}
	]
};

export const YoungRebelzCartData = {
	display_name: 'Young Rebelz',
	cart_status: 'active',
	platform_id: 'shopify',
	shop_id: 'youngrebelz.com',
	shop_properties: {
		paypal: {
			clientId: 'AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr',
			merchantId: 'kumar@harrysholding.com'
		}
	},
	cart_id: 'ae03d943-9daa-4600-929b-d796495ca4ea',
	urls: {},
	line_items: [
		{
			domain: 'youngrebelz.com',
			readOnly: false,
			line_item_id: '76bc42af-c572-4d64-9b76-9b853083151f',
			sku: '42384793469105',
			base_sku: '7395908321457',
			quantity: 1,
			msrp: {
				currency: 'USD',
				value: 42.99
			},
			price: {
				currency: 'USD',
				value: 1
			},
			line_price: {
				currency: 'USD',
				value: 1
			},
			requires_shipping: true,
			image: {
				url: 'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_large.jpg?v=1671231451',
				large:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_large.jpg?v=1671231451',
				grande:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_grande.jpg?v=1671231451',
				medium:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_medium.jpg?v=1671231451',
				compact:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_compact.jpg?v=1671231451',
				small:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_small.jpg?v=1671231451'
			},
			platform_line_item_id: 'be436e6736a6721f6ce62a3f47c7cf9c',
			description: 'Plant 2 : Do not order',
			variant_description: 'L / Sky Blue'
		},
		{
			domain: 'youngrebelz.com',
			readOnly: false,
			line_item_id: '03210106-5a9b-4624-b184-3e4341de9e32',
			sku: '29228172836916',
			base_sku: '3796136493108',
			quantity: 1,
			msrp: {
				currency: 'USD',
				value: 0.5
			},
			price: {
				currency: 'USD',
				value: 0.5
			},
			line_price: {
				currency: 'USD',
				value: 0.5
			},
			requires_shipping: true,
			image: {
				url: 'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Baby_Jersey_Bodysuit-Front_large.jpg?v=1565573135',
				large:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Baby_Jersey_Bodysuit-Front_large.jpg?v=1565573135',
				grande:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Baby_Jersey_Bodysuit-Front_grande.jpg?v=1565573135',
				medium:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Baby_Jersey_Bodysuit-Front_medium.jpg?v=1565573135',
				compact:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Baby_Jersey_Bodysuit-Front_compact.jpg?v=1565573135',
				small:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Baby_Jersey_Bodysuit-Front_small.jpg?v=1565573135'
			},
			platform_line_item_id: '71d822eb155fa3707d913a60ef0e2f2e',
			description: 'Baby Jersey Bodysuit White',
			variant_description: '6 months'
		}
	],
	sub_total: {
		currency: 'USD',
		value: 1.5
	},
	cart_discount: {
		currency: 'USD',
		value: 0
	},
	shipping_total: {
		currency: 'USD',
		value: 0
	},
	tax: {
		currency: 'USD',
		value: 0
	},
	total: {
		currency: 'USD',
		value: 1.5
	},
	payment_method_options: [
		{
			type: 'CreditCard',
			wallet: 'user'
		},
		{
			type: 'PayPal',
			wallet: 'paypal'
		},
		{
			type: 'ShopPay',
			wallet: 'shoppay'
		}
	]
};

export const EmptyCart = {
	args: {
		cartHive: new CartHive([])
	}
};

export const EmptyCartAddingProduct = {
	args: {
		cartHive: new CartHive([]),
		addingToCart: true
	}
};

export const SingleCart = {
	args: {
		cartHive: new CartHive([FirmlyAICartData])
	}
};

export const MultipleCarts = {
	args: {
		cartHive: new CartHive([FirmlyAICartData, MagentoCartData, YoungRebelzCartData])
	}
};
