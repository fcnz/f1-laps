import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {
	getDrivers,
	getIntervals,
	getLaps,
	getSessions,
	getWeather,
	type LapDTO
} from '$lib/queries';
import { getFastest } from '$lib/getFastest';

export const load: PageLoad = async ({ params, fetch }) => {
	const laps = await getLaps({ session_key: params.session_key }, { fetch });
	const drivers = await getDrivers({ session_key: params.session_key }, { fetch });
	const session = await getSessions({ session_key: params.session_key }, { fetch }).then(
		(sessions) => sessions[0]
	);
	const weather = await getWeather({ session_key: params.session_key }, { fetch });
	const intervals = await getIntervals({ session_key: params.session_key }, { fetch });

	const firstLap = laps.reduce<LapDTO | null>((last, lap) => {
		if (lap.date_start == null) return last;
		if (last == null) return lap;
		return lap.date_start < last.date_start ? lap : last;
	}, null);
	if (!firstLap || !firstLap.date_start) {
		throw error(500, 'No laps');
	}
	const firstLapDate = firstLap.date_start;

	const lastLap = laps.reduce<LapDTO | null>((last, lap) => {
		if (lap.date_start == null) return last;
		if (last == null) return lap;
		return lap.date_start > last.date_start ? lap : last;
	}, null);
	if (!lastLap || !lastLap.date_start) {
		throw error(500, 'No laps');
	}
	const lastLapDate = lastLap.date_start;

	const lapsWithDriver = laps.map((lap) => {
		const driver = drivers.find((driver) => driver.driver_number === lap.driver_number);
		if (!driver) throw error(500, `Unable to find driver ${lap.driver_number}`);
		return { ...lap, driver };
	});

	const driversWithLaps = drivers.map((driver) => {
		const lapsForDriver = lapsWithDriver.filter(
			(lap) => driver.driver_number === lap.driver_number
		);
		const _intervals = intervals
			.filter((i) => i.driver_number === driver.driver_number)
			.sort((a, b) => (a.date > b.date ? 1 : -1));
		const _lastInterval = _intervals.length ? _intervals[_intervals.length - 1] : undefined;

		const fastestLap = getFastest(lapsForDriver);
		return {
			...driver,
			laps: lapsForDriver,
			fastestLap,
			gapToLeader: _lastInterval?.gap_to_leader
		};
	});

	if (session.session_type === 'Race') {
		driversWithLaps.sort((a, b) =>
			a.gapToLeader != null && b.gapToLeader != null ? a.gapToLeader - b.gapToLeader : 0
		);
	} else {
		driversWithLaps.sort(
			(a, b) => (a.fastestLap?.lap_duration || 10_000) - (b.fastestLap?.lap_duration || 10_000)
		);
	}

	return {
		laps: lapsWithDriver,
		drivers: driversWithLaps,
		session,
		weather,
		firstLapDate,
		lastLapDate
	};
};
