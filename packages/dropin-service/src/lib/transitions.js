// @ts-nocheck
import { slide } from 'svelte/transition';

export function fadeSlide(node, options) {
    // @ts-ignore
    const slideTrans = slide(node, options);
    return {
        duration: options.duration,
        // @ts-ignore
        css: (t) => `
            ${slideTrans.css(t)}
            opacity: ${t};
        `,
    };
}
