const API_BASE_URL = 'https://api.openf1.org/v1/';

export type ParamsType<T extends string | number | symbol = any> = Partial<
	Record<T, string | number | boolean>
>;

function buildUrl(endpoint: string, params: ParamsType = {}): string {
	const url = new URL(endpoint, API_BASE_URL);
	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.append(key, String(value));
	});
	return url.toString();
}

function queryFactory<T>(
	endpoint: string
): (
	params: ParamsType<keyof T>,
	opts?: { fetch?: typeof fetch; cache?: RequestCache }
) => Promise<T[]> {
	return async (params, { fetch: _fetch = fetch, cache = 'force-cache' } = {}) => {
		const url = buildUrl(endpoint, params);
		const response = await _fetch(url, { cache });
		if (!response.ok) {
			throw new Error(`Failed to fetch data from ${url}`);
		}
		return response.json();
	};
}

export interface DriverDTO {
	broadcast_name: string;
	country_code: string;
	driver_number: number;
	first_name: string;
	full_name: string;
	headshot_url: string;
	last_name: string;
	meeting_key: number;
	name_acronym: string;
	session_key: number;
	team_colour: string;
	team_name: string;
}

export const getDrivers = queryFactory<DriverDTO>('drivers');

export interface SessionDTO {
	circuit_key: number;
	circuit_short_name: string;
	country_code: string;
	country_key: number;
	country_name: string;
	date_end: string;
	date_start: string;
	gmt_offset: string;
	location: string;
	meeting_key: number;
	session_key: number;
	session_name: string;
	session_type: string;
	year: number;
}

export const getSessions = queryFactory<SessionDTO>('sessions');

export interface LapDTO {
	date_start: string;
	driver_number: number;
	duration_sector_1: number;
	duration_sector_2: number;
	duration_sector_3: number;
	i1_speed: number;
	i2_speed: number;
	is_pit_out_lap: boolean;
	lap_duration: number;
	lap_number: number;
	meeting_key: number;
	segments_sector_1: number[];
	segments_sector_2: number[];
	segments_sector_3: number[];
	session_key: number;
	st_speed: number;
}

export const getLaps = queryFactory<LapDTO>('laps');

export interface StintDTO {
	compound: string;
	driver_number: number;
	lap_end: number;
	lap_start: number;
	meeting_key: number;
	session_key: number;
	stint_number: number;
	tyre_age_at_start: number;
}

export const getStints = queryFactory<StintDTO>('stints');

export interface WeatherDTO {
	air_temperature: number;
	date: string;
	humidity: number;
	meeting_key: number;
	pressure: number;
	rainfall: number;
	session_key: number;
	track_temperature: number;
	wind_direction: number;
	wind_speed: number;
}

export const getWeather = queryFactory<WeatherDTO>('weather');

export interface PositionDTO {
	date: string;
	driver_number: number;
	meeting_key: number;
	position: number;
	session_key: number;
}

export const getPositions = queryFactory<PositionDTO>('positions');

export interface IntervalDTO {
	date: string;
	session_key: number;
	gap_to_leader: number;
	interval: number;
	meeting_key: number;
	driver_number: number;
}

export const getIntervals = queryFactory<IntervalDTO>('intervals');
