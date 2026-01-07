<script>
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import { ProfileEditCard, ActiveSessionsCard } from '$lib/components/profile/index.js';

	/**
	 * @type {{
	 *   user: {email: string, name?: string, title?: string, avatar_url?: string},
	 *   sessions: Array<{id: string, device: string, browser: string, location: string, lastActive: string, isCurrent: boolean}>,
	 *   isLoadingSessions: boolean,
	 *   sessionsError: string,
	 *   backUrl: string,
	 *   logoutUrl: string,
	 *   onSaveProfile: (data: {name: string, title: string}) => Promise<void>,
	 *   onTerminateSession: (sessionId: string) => Promise<void>,
	 *   onTerminateAllSessions: () => Promise<void>,
	 *   onRetryLoadSessions: () => void
	 * }}
	 */
	let {
		user = { email: '', name: '', title: '' },
		sessions = [],
		isLoadingSessions = false,
		sessionsError = '',
		backUrl = '/',
		logoutUrl = '/api/auth/logout',
		onSaveProfile = async () => {},
		onTerminateSession = async () => {},
		onTerminateAllSessions = async () => {},
		onRetryLoadSessions = () => {}
	} = $props();

	// Profile editing state
	let isEditing = $state(false);
	let isSaving = $state(false);
	let profileError = $state('');
	let profileSuccess = $state('');

	// Sessions state
	let terminatingSessionId = $state(null);
	let isTerminatingAll = $state(false);

	async function handleSaveProfile(formData) {
		isSaving = true;
		profileError = '';
		profileSuccess = '';

		try {
			await onSaveProfile(formData);
			isEditing = false;
			profileSuccess = 'Profile updated successfully';
			setTimeout(() => {
				profileSuccess = '';
			}, 3000);
		} catch (err) {
			profileError = err.message;
		} finally {
			isSaving = false;
		}
	}

	async function handleTerminateSession(sessionId) {
		terminatingSessionId = sessionId;

		try {
			await onTerminateSession(sessionId);
		} catch {
			// Error handled by parent
		} finally {
			terminatingSessionId = null;
		}
	}

	async function handleTerminateAllSessions() {
		isTerminatingAll = true;

		try {
			await onTerminateAllSessions();
		} catch {
			// Error handled by parent
		} finally {
			isTerminatingAll = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-2xl px-4 py-8">
		<!-- Back button -->
		<div class="mb-6">
			<a
				href={backUrl}
				class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
			>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back to Dashboards
			</a>
		</div>

		<!-- Profile Card -->
		<ProfileEditCard
			{user}
			onSave={handleSaveProfile}
			bind:isEditing
			{isSaving}
			error={profileError}
			success={profileSuccess}
		/>

		<!-- Sessions Card -->
		<div class="mt-6">
			<ActiveSessionsCard
				{sessions}
				isLoading={isLoadingSessions}
				{terminatingSessionId}
				{isTerminatingAll}
				error={sessionsError}
				onTerminate={handleTerminateSession}
				onTerminateAll={handleTerminateAllSessions}
				onRetry={onRetryLoadSessions}
			/>
		</div>

		<!-- Sign Out -->
		<div class="mt-6 text-center">
			<a href={logoutUrl} class="text-sm text-red-600 hover:text-red-700 hover:underline">
				Sign out of this device
			</a>
		</div>
	</div>
</div>
