import { getDrivers, getIntervals, getLaps, getSessions, getStints } from '$lib/queries';
import { resolveMap } from '$lib/resolve-map';
import type { LayoutLoad } from './$types';
import { getFastest } from '$lib/getFastest';

export const load: LayoutLoad = async ({ params, fetch }) => {
	const session = await getSessions({ session_key: params.session_key }, { fetch }).then(
		(sessions) => sessions[0]
	);

	const data = await resolveMap({
		drivers: getDrivers({ session_key: params.session_key }, { fetch }),
		laps: getLaps({ session_key: params.session_key }, { fetch }),
		stints: getStints({ session_key: params.session_key }, { fetch }),
		intervals: getIntervals({ session_key: params.session_key }, { fetch })
	});

	const laps = data.laps.map((lap) => {
		const stint = data.stints.find(
			(s) =>
				s.driver_number === lap.driver_number &&
				s.lap_start <= lap.lap_number &&
				s.lap_end >= lap.lap_number
		);
		return {
			...lap,
			stint
		};
	});

	const stints = data.stints.map((stint) => {
		const _laps = laps.filter(
			(lap) =>
				stint.driver_number === lap.driver_number &&
				stint.lap_start <= lap.lap_number &&
				stint.lap_end >= lap.lap_number
		);
		return { ...stint, laps: _laps, fastestLap: getFastest(_laps) };
	});

	const fastestLap = getFastest(laps);

	const driversNoGap = data.drivers.map((driver) => {
		const _laps = laps.filter((l) => l.driver_number === driver.driver_number);
		const _fastestLap = getFastest(_laps);
		const _stints = stints.filter((s) => s.driver_number === driver.driver_number);
		const _intervals = data.intervals
			.filter((i) => i.driver_number === driver.driver_number)
			.sort((a, b) => (a.date > b.date ? 1 : -1));
		const _lastInterval = _intervals.length ? _intervals[_intervals.length - 1] : undefined;

		return {
			...driver,
			laps: _laps,
			stints: _stints,
			fastestLap: _fastestLap,
			gap: 0,
			delta: _fastestLap && fastestLap ? _fastestLap.lap_duration - fastestLap.lap_duration : 0,
			isFastest: _fastestLap && fastestLap && _fastestLap.lap_duration === fastestLap.lap_duration,
			gapToLeader: _lastInterval?.gap_to_leader
		};
	});

	if (session.session_type === 'Race') {
		driversNoGap.sort((a, b) =>
			a.gapToLeader != null && b.gapToLeader != null ? a.gapToLeader - b.gapToLeader : 0
		);
	} else {
		driversNoGap.sort(
			(a, b) => (a.fastestLap?.lap_duration || 10_000) - (b.fastestLap?.lap_duration || 10_000)
		);
	}

	const drivers = driversNoGap.map((driver, index) => {
		let gap = 0;
		if (index > 0) {
			const fastestLapAhead = driversNoGap[index - 1].fastestLap;
			if (driver.fastestLap && fastestLapAhead) {
				gap = driver.fastestLap.lap_duration - fastestLapAhead.lap_duration;
			}
		}
		return { ...driver, gap };
	});

	return { ...data, session, drivers, fastestLap, laps };
};
