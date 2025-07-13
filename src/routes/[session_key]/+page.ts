import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { page } from '$app/state';
import { resolveRoute } from '$app/paths';

export const load: PageLoad = ({ params, route: { id } }) => {
	const toGoto = resolveRoute(id + '/drivers', params);
	redirect(302, toGoto);
};
