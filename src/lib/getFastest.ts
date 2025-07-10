export function getFastest<T extends { lap_duration: number; lap_number: number }>(
	laps: T[]
): T | null {
	return laps.reduce((fastest: T | null, lap) => {
		if (!lap.lap_duration) return fastest;
		if (!fastest) return lap;
		if (lap.lap_duration === fastest.lap_duration) {
			return lap.lap_number < fastest.lap_number ? lap : fastest;
		}
		return lap.lap_duration < fastest.lap_duration ? lap : fastest;
	}, null);
}
