import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { drivers, fastestLap } = await parent();

	const driver = drivers.find((d) => String(d.driver_number) === params.driver_number);
	if (driver == null) {
		throw error(404, `Can't find driver ${params.driver_number}`);
	}
	const isFastest = fastestLap != null && String(fastestLap.driver_number) === params.driver_number;

	return { driver, isFastest };
};
