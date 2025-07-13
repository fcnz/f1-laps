<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	const { data, children }: LayoutProps = $props();

	function handleDriverClick(driverNumber: number) {
		const toGoto = resolveRoute('/[session_key]/drivers/[driver_number]', {
			...page.params,
			driver_number: String(driverNumber)
		});
		goto(toGoto);
	}
</script>

<div class="flex w-full flex-1 gap-8">
	<table class="mt-4 h-0">
		<thead>
			<tr>
				<th></th>
				<th class="text-center">Driver</th>
				<th class="px-2">Fastest</th>
				<th class="px-2">Δ Leader</th>
				<th class="px-2">Δ Ahead</th>
				<th class="px-2">Lap #</th>
				<th class="px-2">Tyre</th>
				<th class="px-2">Tyre Age</th>
			</tr>
		</thead>
		<tbody>
			{#each data.drivers as driver, index}
				<tr
					class="cursor-pointer hover:bg-blue-400 {page.params.driver_number ===
					String(driver.driver_number)
						? 'bg-blue-300'
						: ''}"
					onclick={() => handleDriverClick(driver.driver_number)}
				>
					<td class="w-0 px-2 text-right font-mono">{index + 1}</td>
					<td
						style="background-color: #{driver.team_colour};"
						class="w-0 px-2 font-mono text-nowrap"
					>
						{String(driver.driver_number).padStart(2, '0')}&nbsp;{driver.name_acronym}
					</td>
					<td class="px-2 text-center font-mono {driver.isFastest ? 'bg-purple-500' : ''}"
						>{driver.fastestLap ? driver.fastestLap.lap_duration.toFixed(3) : '-'}</td
					>
					<td class="px-2 text-center font-mono"
						>{#if driver.delta}+{driver.delta.toFixed(3)}{/if}</td
					>
					<td class="px-2 text-center font-mono"
						>{#if driver.gap}+{driver.gap.toFixed(3)}{/if}</td
					>
					<td class="px-2 text-center font-mono"
						>{driver.fastestLap ? String(driver.fastestLap.lap_number).padStart(2, '0') : '-'}</td
					>
					<td class="px-2 text-center">{driver.fastestLap?.stint?.compound ?? '-'}</td>
					<td class="px-2 text-center font-mono">
						{#if driver.fastestLap && driver.fastestLap?.stint}
							{driver.fastestLap.lap_number - driver.fastestLap?.stint?.lap_start}
						{:else}
							-
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="flex-1">{@render children()}</div>
</div>
