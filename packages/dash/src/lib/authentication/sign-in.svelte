<script lang="ts">
	export let title = 'Sign in to platform';
	export let rememberMe = true;
	export let lostPassword = true;
	export let createAccount = true;
	export let lostPasswordLink = '';
	export let loginTitle = 'Login to your account';
	export let registerLink = '';
	export let showLogin = true;
	export let createAccountTitle = 'Create account';
</script>

<div
	class="flex flex-col items-center justify-center px-6 pt-8 mx-auto grow-1 pt:mt-0 dark:bg-gray-900"
>
	<!-- Card -->
	<div class="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
		<h1 class="text-center text-2xl font-bold text-gray-900 dark:text-white">
			{title}
		</h1>
		<form class="mt-8 space-y-6" on:submit|preventDefault>
			<slot />
			{#if rememberMe || lostPassword}
				<div class="flex items-start">
					{#if rememberMe}
						<div class="flex items-center h-5">
							<input
								type="checkbox"
								id="remember"
								aria-describedby="remember"
								name="remember"
								value={1}
							/>
						</div>
						<div class="ml-3 text-sm">
							<label for="remember">Remember me</label>
						</div>
					{/if}
					{#if lostPassword}
						<a href={lostPasswordLink} class="ml-auto text-sm">Lost Password?</a>
					{/if}
				</div>
			{/if}
			{#if showLogin}
				<button type="submit">{loginTitle}</button>
			{/if}
			{#if createAccount}
				<div class="text-sm font-medium text-gray-500 dark:text-gray-400">
					Not registered? <a
						href={registerLink}
						class="text-primary-700 hover:underline dark:text-primary-500">{createAccountTitle}</a
					>
				</div>
			{/if}
		</form>
	</div>
</div>
