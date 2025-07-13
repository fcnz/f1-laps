<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { base, resolveRoute } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	let selectedSession = $state(page.params.session_key || '');
	$effect(() => {
		if (page.params.session_key) {
			selectedSession = page.params.session_key;
		}
	});

	function handleSelect() {
		if (!page.route.id) return;
		let toGoto: string;
		if (page.route.id.includes('[session_key]')) {
			toGoto = resolveRoute(page.route.id, { ...page.params, session_key: selectedSession });
		} else {
			toGoto = resolveRoute('/[session_key]/drivers', { session_key: selectedSession });
		}
		goto(toGoto);
	}
</script>

<div class="flex h-screen flex-col">
	<nav class="flex items-center border-b">
		<a href={resolveRoute('/', {})}>
			<img src="{base}/favicon.png" alt="Logo" class="h-12 w-12 p-2" />
		</a>
		<select
			name="sessions"
			id="session-picker"
			bind:value={selectedSession}
			onchange={handleSelect}
		>
			<option value="" disabled selected>Select a session</option>
			{#each data.sessions as session}
				<option
					value={String(session.session_key)}
					selected={String(session.session_key) === selectedSession}
				>
					{session.circuit_short_name} - {session.session_name}
				</option>
			{/each}
		</select>
		<a class="ml-auto p-2" href="https://github.com/fcnz/f1-laps" aria-label="GitHub repository"
			><svg
				aria-hidden="true"
				focusable="false"
				class="octicon octicon-mark-github"
				viewBox="0 0 24 24"
				width="32"
				height="32"
				fill="currentColor"
				display="inline-block"
				overflow="visible"
				style="vertical-align:text-bottom"
				><path
					d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"
				></path></svg
			></a
		>
	</nav>

	<div class="flex-1 overflow-y-auto">
		{@render children()}
	</div>
</div>
