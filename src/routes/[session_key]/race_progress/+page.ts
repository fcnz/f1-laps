import type { PageLoad } from './$types';
import { getDrivers, getIntervals, getSessions } from '$lib/queries';

export const load: PageLoad = async ({ params, fetch }) => {
	const drivers = await getDrivers({ session_key: params.session_key }, { fetch });
	const session = await getSessions({ session_key: params.session_key }, { fetch }).then(
		(sessions) => sessions[0]
	);
	const intervals = await getIntervals({ session_key: params.session_key }, { fetch });

	const driversWithIntervals = drivers
		.map((driver) => {
			const _intervals = intervals
				.filter((i) => i.driver_number === driver.driver_number)
				.filter((_, index) => index % 10 === 0)
				.sort((a, b) => (a.date > b.date ? 1 : -1));
			const _lastInterval = _intervals.length ? _intervals[_intervals.length - 1] : undefined;

			return {
				...driver,
				intervals: _intervals,
				gapToLeader: _lastInterval?.gap_to_leader
			};
		})
		.sort((a, b) =>
			a.gapToLeader != null && b.gapToLeader != null ? a.gapToLeader - b.gapToLeader : 0
		);

	return {
		drivers: driversWithIntervals,
		session
	};
};
