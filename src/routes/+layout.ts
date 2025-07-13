import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { getSessions } from '$lib/queries';

export const ssr = false;

export const load: LayoutLoad = async ({ params, fetch }) => {
	try {
		const sessions = await getSessions({ year: 2025 }, { fetch, cache: 'no-cache' });
		sessions.reverse();

		return {
			sessions,
			activeSession: params.session_key || ''
		};
	} catch (err) {
		error(500, 'An error occurred while loading the layout ' + err);
	}
};
