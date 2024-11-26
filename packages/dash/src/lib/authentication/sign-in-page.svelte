<script lang="ts">
	import SignInForm from './sign-in-form.svelte';
</script>

<div
	class="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0"
>
	<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
		<div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);"
		/>
		<div class="relative z-20 flex items-center text-lg font-medium">firmly AI Dashboard</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">Buy now, anywhere®</p>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Welcome</h1>
				<p class="text-sm text-muted-foreground">Log in to continue</p>
			</div>
			<SignInForm />
			<p class="px-8 text-center text-sm text-muted-foreground">
				By continuing, you agree to our
				<a
					href="https://www.firmly.ai/terms"
					target="_blank"
					class="underline underline-offset-4 hover:text-primary"
				>
					Terms of Service
				</a>
				and
				<a
					href="https://www.firmly.ai/privacy"
					target="_blank"
					class="underline underline-offset-4 hover:text-primary"
				>
					Privacy Policy
				</a>
				.
			</p>
		</div>
	</div>
</div>
