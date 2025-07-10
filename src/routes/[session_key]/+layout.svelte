<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import SessionInfo from './SessionInfo.svelte';

	const { data, children }: LayoutProps = $props();
</script>

<div class="flex h-full flex-col">
	<div>
		<SessionInfo session={data.session} />
	</div>
	<div class="mt-2 flex border-b px-4">
		<a
			class="cursor-pointer px-2 py-1 hover:bg-green-100 {(page.route.id ?? '').includes('drivers')
				? 'bg-green-100'
				: ''}"
			href="/{page.params.session_key}/drivers">Drivers</a
		>
		<a
			class="cursor-pointer px-2 py-1 hover:bg-green-100 {(page.route.id ?? '').includes('laps')
				? 'bg-green-100'
				: ''}"
			href="/{page.params.session_key}/laps">Laps</a
		>
	</div>
	<div class="mt-4 w-full flex-1">
		{@render children()}
	</div>
</div>
