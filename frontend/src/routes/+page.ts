import { validateUser } from '../services/api/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	try {
		const user = await validateUser();
		return {
			user
		};
	} catch (error) {
		if (error instanceof Error) {
			console.error('failed to fetch user: ');
			console.error(error.message);
		}
	}
	return;
};
