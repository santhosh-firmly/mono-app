export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17')
];

export const server_loads = [];

export const dictionary = {
		"/": [~5],
		"/configurator-content": [13],
		"/configurator": [12],
		"/drawer": [14],
		"/embed": [15,[3]],
		"/(dynamo)/mk": [~6,[2]],
		"/(dynamo)/mk/cart-drawer": [~7,[2]],
		"/(dynamo)/mk/checkout": [~8,[2]],
		"/(dynamo)/mk/construction": [~9,[2]],
		"/(dynamo)/mk/header": [~10,[2]],
		"/(dynamo)/mk/thank-you/[slug]": [~11,[2]],
		"/mock": [16,[4]],
		"/single-page": [17]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';