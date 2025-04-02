// @ts-nocheck
export function serverLogInfo() {
	console.info.apply(console, arguments);
}

export function serverLogError() {
	console.error.apply(console, arguments);
}

export function serverLogWarn() {
	console.warn.apply(console, arguments);
}
