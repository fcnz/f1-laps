<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="p-4">
	<h1 class="text-lg font-bold">Welcome to F1 Laps</h1>
	<p>Pick a session from the list to see laps.</p>

	<table class="m-4">
		<tbody class="w-full">
			{#each data.sessions as session}
				<tr
					class="cursor-pointer hover:bg-gray-100"
					onclick={() =>
						goto(resolveRoute('/[session_key]', { session_key: String(session.session_key) }))}
				>
					<td class="w-0 px-2 py-1">{session.circuit_short_name}</td>
					<td class="w-full px-2 py-1">{session.session_name}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
