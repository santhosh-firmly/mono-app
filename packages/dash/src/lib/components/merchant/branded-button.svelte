<script>
	/**
	 * @type {'primary' | 'secondary' | 'tertiary'}
	 */
	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		class: className = '',
		onclick,
		children
	} = $props();
</script>

<button {type} {disabled} {onclick} class="branded-btn branded-btn-{variant} {className}">
	{@render children()}
</button>

<style>
	.branded-btn {
		width: 100%;
		border-radius: 0.375rem;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.branded-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Primary: Purple background, gold hover */
	.branded-btn-primary {
		background-color: #7979ff;
		color: white;
		font-weight: 600;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.branded-btn-primary:hover:not(:disabled) {
		background-color: #ffbf00;
		color: #1a1a1a;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	.branded-btn-primary:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Secondary: Purple border, gold hover */
	.branded-btn-secondary {
		background-color: transparent;
		border: 2px solid #7979ff;
		color: #7979ff;
	}

	.branded-btn-secondary:hover:not(:disabled) {
		background-color: #ffbf00;
		border-color: #ffbf00;
		color: #1a1a1a;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	.branded-btn-secondary:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Tertiary: Ghost style, subtle hover */
	.branded-btn-tertiary {
		background-color: transparent;
		border: 1px solid hsl(var(--border));
		color: hsl(var(--foreground));
	}

	.branded-btn-tertiary:hover:not(:disabled) {
		background-color: hsl(var(--accent));
		border-color: hsl(var(--border));
	}
</style>
