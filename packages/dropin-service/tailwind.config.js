import containerQueries from '@tailwindcss/container-queries';
import typography from '@tailwindcss/typography';
import FlowBitePlugin from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {
            colors: {
                'fy-primary': 'var(--fy-primary)',
                'fy-on-primary': 'var(--fy-on-primary)',
                'fy-on-primary-subtle': 'var(--fy-on-primary-subtle)',
                'fy-action': 'var(--fy-action)',
                'fy-on-action': 'var(--fy-on-action)',
                'fy-background': 'var(--fy-background)',
                'fy-on-background': 'var(--fy-on-background)',
                'fy-surface': 'var(--fy-surface)',
                'fy-surface-subtle': 'var(--fy-surface-subtle)',
                'fy-on-surface': 'var(--fy-on-surface)',
                'fy-on-surface-subtle': 'var(--fy-on-surface-subtle)',
                'fy-alert': 'var(--fy-alert)',
                'fy-on-alert': 'var(--fy-on-alert)',
                'fy-form-element-input-focus': 'var(--fy-form-element-input-focus)',
                'fy-form-element-input-error': 'var(--fy-form-element-input-error)',
                'fy-on-primary-subtle2': 'var(--fy-on-primary-subtle2)',
                'fy-on-primary-accent': 'var(--fy-on-primary-accent)',
            },
        },
        minWidth: {
            80: '80px',
        },
    },

    plugins: [typography, containerQueries, FlowBitePlugin],
};
