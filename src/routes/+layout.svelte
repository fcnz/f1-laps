<script lang="ts">
	import { goto } from '$app/navigation';
	import { base, resolveRoute } from '$app/paths';
	import { page } from '$app/state';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const sessions = data.sessions
		.map((session: any) => ({
			title: `${session.circuit_short_name} - ${session.session_name}`,
			session_key: String(session.session_key)
		}))
		.toReversed();

	let selectedSession = $state(data.activeSession);

	function handleSelect() {
		if (!page.route.id) return;
		const toGoto =
			base + resolveRoute(page.route.id, { ...page.params, session_key: selectedSession });
		console.log('🚀 ~ handleSelect ~ toGoto:', toGoto);
		goto(toGoto);
	}
</script>

<div class="flex h-screen flex-col">
	<nav class="flex border-b">
		<img src="/favicon.png" alt="Logo" class="h-12 w-12 p-2" />
		<select
			name="sessions"
			id="session-picker"
			bind:value={selectedSession}
			onchange={handleSelect}
		>
			<option value="" disabled selected>Select a session</option>
			{#each sessions as session}
				<option value={session.session_key} selected={session.session_key === selectedSession}>
					{session.title}
				</option>
			{/each}
		</select>
	</nav>

	<div class="flex-1 overflow-y-auto">
		{@render children()}
	</div>
</div>
