<script lang="ts">
	const { data } = $props();

	function timeDeltaToStart(time: Date | string | number) {
		if (!(time instanceof Date)) time = new Date(time);

		const reference = new Date(data.session.date_start);
		const diff = Math.round((time.getTime() - reference.getTime()) / 1000);

		const hours = Math.floor(diff / 3600);
		const mins = Math.floor((diff % 3600) / 60);
		const secs = diff % 60;

		return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
</script>

<div class="my-4">
	<table>
		<thead>
			<tr>
				<th class="w-0"></th>
				<th class="w-0 px-2 text-nowrap">Time</th>
				<th class="w-0 px-2 text-nowrap">Δ Prev</th>
				<th class="w-0 px-2 text-nowrap">Δ Best</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.driver.stints as stint}
				<tr>
					<td></td>
					<td colspan="100" class="pt-4 text-center font-bold first:mt-0">
						{stint.stint_number}&mdash;Start={timeDeltaToStart(stint.laps[0].date_start)}
						Compound={stint.compound} TyreAge={stint.tyre_age_at_start}
					</td>
				</tr>
				{#each stint.laps as lap, index}
					<tr
						class={lap.lap_duration && lap.lap_duration === data.driver.fastestLap?.lap_duration
							? data.isFastest
								? 'bg-purple-500'
								: 'bg-green-500'
							: ''}
					>
						<td class="w-0 px-2 text-right font-mono">{index ? index : ''}</td>
						{#if lap.is_pit_out_lap}
							<td class="px-2 text-right"> Pit Out </td>
						{:else if index === stint.laps.length - 1}
							<td class="px-2 text-right"> Pit In </td>
						{:else}
							<td class="w-0 px-2 text-right font-mono">
								{lap.lap_duration ? lap.lap_duration.toFixed(3) : '-'}
							</td>
							<td class="w-0 px-2 text-right font-mono">
								{#if index > 1}
									{@const delta = lap.lap_duration - stint.laps[index - 1].lap_duration}
									{delta > 0 ? '+' : ''}{delta.toFixed(3)}
								{/if}
							</td>
							<td class="w-0 px-2 text-right font-mono">
								{#if index > 0 && data.driver.fastestLap && data.driver.fastestLap.date_start !== lap.date_start}
									{@const delta = lap.lap_duration - data.driver.fastestLap.lap_duration}
									{delta > 0 ? '+' : ''}{delta.toFixed(3)}
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
</div>
