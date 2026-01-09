<script>
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { InvalidInviteCard } from '$lib/components/invite/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import User from 'lucide-svelte/icons/user';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Mail from 'lucide-svelte/icons/mail';
	import CheckCircle from 'lucide-svelte/icons/check-circle';

	let { data } = $props();

	let formData = $state({
		name: '',
		company: '',
		title: '',
		location: ''
	});

	// OTP verification state
	let verificationCode = $state('');
	let otpSent = $state(false);
	let otpSending = $state(false);
	let otpError = $state('');
	let otpCooldown = $state(0);

	let isSubmitting = $state(false);
	let error = $state('');

	// Start cooldown timer when OTP is sent
	$effect(() => {
		if (otpCooldown > 0) {
			const timer = setTimeout(() => {
				otpCooldown = otpCooldown - 1;
			}, 1000);
			return () => clearTimeout(timer);
		}
	});

	async function requestOTP() {
		otpSending = true;
		otpError = '';

		try {
			const response = await fetch('/api/invite/send-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: data.token })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send verification code');
			}

			otpSent = true;
			otpCooldown = 60; // 60 second cooldown before resend
		} catch (err) {
			otpError = err.message;
		} finally {
			otpSending = false;
		}
	}

	const roleLabels = {
		owner: 'Owner',
		editor: 'Editor',
		viewer: 'Viewer'
	};

	async function handleSubmit(e) {
		e.preventDefault();

		if (!formData.name.trim()) {
			error = 'Please enter your name';
			return;
		}

		if (!verificationCode.trim()) {
			error = 'Please enter the verification code';
			return;
		}

		if (!/^\d{6}$/.test(verificationCode)) {
			error = 'Verification code must be 6 digits';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			const response = await fetch('/api/invite/accept', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token: data.token,
					verificationCode: verificationCode.trim(),
					profile: {
						name: formData.name.trim(),
						company: formData.company.trim(),
						title: formData.title.trim(),
						location: formData.location.trim()
					}
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to accept invitation');
			}

			// Redirect to merchant dashboard
			goto(result.redirectTo);
		} catch (err) {
			error = err.message;
			isSubmitting = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	{#if !data.valid}
		<InvalidInviteCard
			error={data.error || 'This invitation link is not valid.'}
			href={data.redirectTo || '/'}
			buttonText={data.redirectTo ? 'Go to Invitation' : 'Go to Home'}
			buttonVariant={data.redirectTo ? 'default' : 'outline'}
		/>
	{:else}
		<Card.Root class="w-full max-w-md">
			<!-- Valid Invite - Profile Form -->
			<Card.Header class="text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100"
				>
					<User class="h-8 w-8 text-purple-600" />
				</div>
				<Card.Title class="text-xl">Complete Your Profile</Card.Title>
				<Card.Description class="text-base">
					Set up your account to access <strong>{data.merchantDomain}</strong>
				</Card.Description>
			</Card.Header>

			<form onsubmit={handleSubmit}>
				<Card.Content class="space-y-4">
					<!-- Email (read-only) -->
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={data.email}
							disabled
							class="bg-gray-50"
						/>
						<p class="text-xs text-gray-500">This email is set by your invitation</p>
					</div>

					<!-- Email Verification -->
					<div class="space-y-2">
						<Label for="verificationCode">Email Verification *</Label>
						{#if !otpSent}
							<div class="space-y-2">
								<Button
									type="button"
									variant="outline"
									class="w-full"
									onclick={requestOTP}
									disabled={otpSending || isSubmitting}
								>
									{#if otpSending}
										<Loader2 class="mr-2 h-4 w-4 animate-spin" />
										Sending...
									{:else}
										<Mail class="mr-2 h-4 w-4" />
										Send Verification Code
									{/if}
								</Button>
								<p class="text-xs text-gray-500">
									We'll send a 6-digit code to <strong>{data.email}</strong> to verify
									your email ownership.
								</p>
							</div>
						{:else}
							<div class="space-y-2">
								<Input
									id="verificationCode"
									type="text"
									inputmode="numeric"
									maxlength="6"
									pattern="\d\{6}"
									bind:value={verificationCode}
									placeholder="Enter 6-digit code"
									disabled={isSubmitting}
									class="font-mono text-center text-lg tracking-widest"
								/>
								<div class="flex items-center justify-between">
									<p class="text-xs text-gray-500">
										<CheckCircle class="inline h-3 w-3 text-green-500" />
										Code sent to {data.email}
									</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={requestOTP}
										disabled={otpCooldown > 0 || otpSending || isSubmitting}
									>
										{#if otpCooldown > 0}
											Resend in {otpCooldown}s
										{:else if otpSending}
											Sending...
										{:else}
											Resend
										{/if}
									</Button>
								</div>
							</div>
						{/if}
						{#if otpError}
							<p class="text-xs text-red-600">{otpError}</p>
						{/if}
					</div>

					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">Full Name *</Label>
						<Input
							id="name"
							bind:value={formData.name}
							placeholder="John Doe"
							disabled={isSubmitting}
							required
						/>
					</div>

					<!-- Company -->
					<div class="space-y-2">
						<Label for="company">Company</Label>
						<Input
							id="company"
							bind:value={formData.company}
							placeholder="Acme Corp"
							disabled={isSubmitting}
						/>
					</div>

					<!-- Job Title -->
					<div class="space-y-2">
						<Label for="title">Job Title</Label>
						<Input
							id="title"
							bind:value={formData.title}
							placeholder="Product Manager"
							disabled={isSubmitting}
						/>
					</div>

					<!-- Location -->
					<div class="space-y-2">
						<Label for="location">Location</Label>
						<Input
							id="location"
							bind:value={formData.location}
							placeholder="San Francisco, CA"
							disabled={isSubmitting}
						/>
					</div>

					<!-- Role info -->
					<div class="rounded-lg bg-gray-50 p-3">
						<p class="text-sm text-gray-500">
							You will be granted <Badge variant="secondary"
								>{roleLabels[data.role]}</Badge
							> access to <strong>{data.merchantDomain}</strong>
						</p>
					</div>

					{#if error}
						<p class="text-sm text-red-600">{error}</p>
					{/if}
				</Card.Content>

				<Card.Footer class="flex-col gap-2">
					<Button type="submit" class="w-full" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Creating Account...
						{:else}
							Accept Invitation
						{/if}
					</Button>
					<Button
						type="button"
						variant="ghost"
						class="w-full"
						href={`/invite?token=${data.token}`}
						disabled={isSubmitting}
					>
						<ArrowLeft class="mr-2 h-4 w-4" />
						Back
					</Button>
				</Card.Footer>
			</form>
		</Card.Root>
	{/if}
</div>
