import * as AuthAPI from '../services/api/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	try {
		const user = await AuthAPI.fetchUser();
		console.log(`load user: ${JSON.stringify(user)}`);
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
