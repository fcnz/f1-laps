import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, fetch, parent }) => {
	const { sessions } = await parent();
	const session = sessions.find((s) => String(s.session_key) === params.session_key);
	if (session == null) {
		throw error(404, `Cannot find session ${params.session_key}`);
	}
	return { session };
};
