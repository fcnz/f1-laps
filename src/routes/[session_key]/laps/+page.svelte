<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import { getFastest } from '$lib/getFastest.js';
	import type { PageProps } from './$types';

	const xIconSvgPath =
		'M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z';

	const { data }: PageProps = $props();

	function deltaMinutes(a: Date, b: Date) {
		return Math.abs((a.getTime() - b.getTime()) / (1000 * 60));
	}

	let chartDiv: HTMLDivElement;
	let chart: echarts.ECharts;

	onMount(() => {
		chart = echarts.init(chartDiv);

		chart.on('legendselectchanged', (params: any) => {
			selectedDrivers = Object.keys(params.selected).reduce((selected, d) => {
				if (params.selected[d]) {
					selected.push(d);
				}
				return selected;
			}, [] as string[]);
		});

		window.addEventListener('resize', () => {
			chart.resize();
		});

		return () => {
			chart.dispose();
		};
	});

	const buildChartOptions = (data: PageProps['data']) => {
		const symbolOptions: string[] = ['circle', `path://${xIconSvgPath}`, 'diamond'];
		const driverSymbols: Record<string, string> = {};
		Object.values(
			data.drivers
				.toSorted((a, b) => a.driver_number - b.driver_number)
				.reduce<{ [team: string]: PageProps['data']['drivers'][number][] }>((teams, d) => {
					if (teams[d.team_name]) {
						teams[d.team_name].push(d);
					} else {
						teams[d.team_name] = [d];
					}
					return teams;
				}, {})
		).forEach((driverSet) =>
			driverSet.forEach((d, i) => (driverSymbols[d.name_acronym] = symbolOptions[i]))
		);
		const laptimeSeries = data.drivers.map((driver) => {
			const seriesData: [number, number][] = [];
			driver.laps.forEach((lap) => {
				if (!lap.lap_duration) return;
				const lapStart = deltaMinutes(new Date(lap.date_start), new Date(data.session.date_start));
				seriesData.push([lapStart, lap.lap_duration]);
			});
			return {
				name: `${driver.name_acronym}`,
				type: 'scatter',
				yAxisId: 'laptime',
				emphasis: {
					focus: 'series'
				},
				color: `#${driver.team_colour}`,
				symbolSize: 10,
				symbol: driverSymbols[driver.name_acronym] || 'circle',
				data: seriesData
			};
		});

		const trackTempData = data.weather
			.filter((w) => w.date >= data.firstLapDate && w.date <= data.lastLapDate)
			.map((w) => [
				deltaMinutes(new Date(w.date), new Date(data.session.date_start)),
				w.track_temperature
			]);

		const rainData = data.weather
			.filter((w) => w.date >= data.firstLapDate && w.date <= data.lastLapDate)
			.map((w) => [deltaMinutes(new Date(w.date), new Date(data.session.date_start)), w.rainfall]);

		const trackTempSeries = {
			name: 'Track Temp',
			type: 'line',
			yAxisId: 'temperature',
			symbolSize: 2.5,
			data: trackTempData
		};
		const rainSeries = {
			name: 'Rainfall',
			type: 'line',
			yAxisId: 'rainfall',
			symbolSize: 2.5,
			data: rainData
		};

		const fastestLaptime = getFastest(data.laps)?.lap_duration ?? 62;

		return {
			title: {
				text: 'Laps vs Start Time'
			},
			tooltip: {},
			legend: {
				data: data.drivers.map((d) => d.name_acronym),
				left: 'center',
				bottom: 10
			},
			xAxis: [
				{
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: '{value}mins'
					},
					splitLine: {
						show: false
					}
				}
			],
			yAxis: [
				{
					id: 'laptime',
					type: 'value',
					scale: true,
					// min: fastestLaptime - 2,
					// max: fastestLaptime * 1.1,
					axisLabel: {
						formatter: (v: number) => v.toFixed(1) + 's'
					},
					splitLine: {
						show: false
					}
				},
				{
					id: 'temperature',
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: '{value}°'
					},
					splitLine: {
						show: false
					}
				},
				{
					id: 'rainfall',
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: ''
					},
					splitLine: {
						show: false
					}
				}
			],
			series: [...laptimeSeries, trackTempSeries, rainSeries]
		};
	};

	let chartOptions = $derived(buildChartOptions(data));

	$effect(() => {
		chart.setOption(chartOptions);
	});

	let selectedDrivers: string[] = $state(data.drivers.map((d) => d.name_acronym));

	$effect(() => {
		if (selectedDrivers.length) {
			data.drivers.forEach((d) => {
				if (selectedDrivers.includes(d.name_acronym)) {
					chart.dispatchAction({ type: 'legendSelect', name: d.name_acronym });
				} else {
					chart.dispatchAction({ type: 'legendUnSelect', name: d.name_acronym });
				}
			});
		} else {
			data.drivers.forEach((d) =>
				chart.dispatchAction({ type: 'legendSelect', name: d.name_acronym })
			);
		}
	});

	const handleDriverClick = (e: MouseEvent, driver: PageProps['data']['drivers'][number]) => {
		if (selectedDrivers.includes(driver.name_acronym)) {
			selectedDrivers = selectedDrivers.filter((d) => d !== driver.name_acronym);
		} else {
			selectedDrivers.push(driver.name_acronym);
		}
	};

	const handleDriverDblClick = (e: MouseEvent, driver: PageProps['data']['drivers'][number]) => {
		selectedDrivers = [driver.name_acronym];
	};

	let showWeather = $state(true);
	$effect(() => {
		if (showWeather) {
			chart.dispatchAction({ type: 'legendSelect', name: 'Rainfall' });
			chart.dispatchAction({ type: 'legendSelect', name: 'Track Temp' });
		} else {
			chart.dispatchAction({ type: 'legendUnSelect', name: 'Rainfall' });
			chart.dispatchAction({ type: 'legendUnSelect', name: 'Track Temp' });
		}
	});
</script>

<div class="flex h-full w-full gap-4">
	<div>
		<table class="select-none">
			<tbody>
				<tr onclick={() => (showWeather = !showWeather)}>
					<td
						>{#if showWeather}
							○
						{/if}</td
					>
					<td class="cursor-pointer px-4" colspan="100">Weather</td>
				</tr>
				{#each data.drivers as driver}
					<tr
						style="background-color: #{driver.team_colour};"
						class="cursor-pointer"
						onclick={(e) => handleDriverClick(e, driver)}
						ondblclick={(e) => handleDriverDblClick(e, driver)}
					>
						<td class="px-2 pl-4 text-xs"
							>{#if !selectedDrivers.length || selectedDrivers.includes(driver.name_acronym)}
								○
							{/if}
						</td>
						<td class="px-2 text-right font-mono">{driver.driver_number}</td>
						<td class="px-2 pr-4 font-mono">{driver.name_acronym}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div bind:this={chartDiv} class="flex-1"></div>
</div>
