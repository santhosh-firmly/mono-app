<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { goto } from '$app/navigation';
	import BrandedButton from './branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	let url = $state('');
	let email = $state('');
	let name = $state('');
	let title = $state('');
	let company = $state('');
	let location = $state('');
	let errors = $state({ url: '', email: '', name: '', title: '', company: '', location: '' });
	let isSubmitting = $state(false);

	function extractDomain(inputUrl) {
		try {
			// Remove protocol if present
			let domain = inputUrl.replace(/^https?:\/\//, '');
			// Remove www. if present
			domain = domain.replace(/^www\./, '');
			// Remove path and query strings
			domain = domain.split('/')[0];
			// Remove port if present
			domain = domain.split(':')[0];
			return domain.toLowerCase();
		} catch {
			return '';
		}
	}

	function getEmailDomain(emailAddress) {
		const parts = emailAddress.split('@');
		return parts.length === 2 ? parts[1].toLowerCase() : '';
	}

	function validateForm() {
		const newErrors = { url: '', email: '', name: '', title: '', company: '', location: '' };
		let isValid = true;

		// Validate URL
		if (!url.trim()) {
			newErrors.url = 'Please enter a URL';
			isValid = false;
		} else {
			const domain = extractDomain(url);
			if (!domain || !domain.includes('.')) {
				newErrors.url = 'Please enter a valid domain';
				isValid = false;
			}
		}

		// Validate email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim()) {
			newErrors.email = 'Please enter your work email';
			isValid = false;
		} else if (!emailRegex.test(email)) {
			newErrors.email = 'Please enter a valid email address';
			isValid = false;
		} else {
			// Check if email domain matches URL domain
			const urlDomain = extractDomain(url);
			const emailDomain = getEmailDomain(email);
			// Allow @firmly.ai emails to onboard any merchant
			const isFirmlyEmail = emailDomain === 'firmly.ai';
			if (urlDomain && emailDomain && urlDomain !== emailDomain && !isFirmlyEmail) {
				newErrors.email = `Email must be from ${urlDomain}. If you must use a different email, please <a href="mailto:support@firmly.ai" class="underline text-primary">contact support</a>.`;
				isValid = false;
			}
		}

		// Validate name
		if (!name.trim()) {
			newErrors.name = 'Please enter your name';
			isValid = false;
		}

		// Validate title
		if (!title.trim()) {
			newErrors.title = 'Please enter your title';
			isValid = false;
		}

		// Validate company
		if (!company.trim()) {
			newErrors.company = 'Please enter your company name';
			isValid = false;
		}

		// Validate location
		if (!location.trim()) {
			newErrors.location = 'Please enter your location';
			isValid = false;
		}

		errors = newErrors;
		return isValid;
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (validateForm()) {
			isSubmitting = true;
			const domain = extractDomain(url);

			try {
				// Send OTP to email
				const response = await fetch('/api/otp/send', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, domain, name, title, company, location })
				});

				if (!response.ok) {
					const data = await response.json();
					errors = { ...errors, email: data.error || 'Failed to send verification code' };
					isSubmitting = false;
					return;
				}

				// Navigate to email verification page
				const params = new URLSearchParams({ email, domain });
				goto(`verify-email?${params.toString()}`);
			} catch {
				errors = {
					...errors,
					email: 'Failed to send verification code. Please try again.'
				};
				isSubmitting = false;
			}
		}
	}
</script>

<Card.Root class="w-full max-w-md mx-auto shadow-xl">
	<Card.Header>
		<FirmlyLogo class="pb-6" />
		<Card.Title class="text-2xl">Sign Up</Card.Title>
		<Card.Description>Enter your store URL and work email to get started</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="url">Store URL</Label>
				<Input
					id="url"
					type="text"
					placeholder="www.merchant.com"
					bind:value={url}
					oninput={() => (errors = { ...errors, url: '' })}
				/>
				{#if errors.url}
					<p class="text-sm text-red-500">{errors.url}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="email">Work Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="john@merchant.com"
					bind:value={email}
					oninput={() => (errors = { ...errors, email: '' })}
				/>
				{#if errors.email}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- errors.email is trusted internal content -->
					<p class="text-sm text-red-500">{@html errors.email}</p>
				{/if}
				<p class="text-sm text-gray-500">We'll send a verification code to this email</p>
			</div>

			<div class="space-y-2">
				<Label for="name">Full Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="John Doe"
					bind:value={name}
					oninput={() => (errors = { ...errors, name: '' })}
				/>
				{#if errors.name}
					<p class="text-sm text-red-500">{errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="title">Job Title</Label>
				<Input
					id="title"
					type="text"
					placeholder="Marketing Manager"
					bind:value={title}
					oninput={() => (errors = { ...errors, title: '' })}
				/>
				{#if errors.title}
					<p class="text-sm text-red-500">{errors.title}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="company">Company</Label>
				<Input
					id="company"
					type="text"
					placeholder="Merchant Inc"
					bind:value={company}
					oninput={() => (errors = { ...errors, company: '' })}
				/>
				{#if errors.company}
					<p class="text-sm text-red-500">{errors.company}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="location">Location</Label>
				<Input
					id="location"
					type="text"
					placeholder="Seattle, WA"
					bind:value={location}
					oninput={() => (errors = { ...errors, location: '' })}
				/>
				{#if errors.location}
					<p class="text-sm text-red-500">{errors.location}</p>
				{/if}
			</div>

			<BrandedButton type="submit" variant="primary" disabled={isSubmitting}>
				{isSubmitting ? 'Sending...' : 'Continue'}
			</BrandedButton>
		</form>
	</Card.Content>
	<Card.Footer class="flex flex-col gap-4">
		<p class="text-xs text-muted-foreground text-center">
			Your work email domain must match your store's website domain to verify ownership.
		</p>
		<div class="text-center text-sm text-muted-foreground">
			Already have an account?
			<a
				href="/"
				class="font-medium underline-offset-4 hover:underline"
				style="color: #7979ff;"
			>
				Sign in
			</a>
		</div>
	</Card.Footer>
</Card.Root>
