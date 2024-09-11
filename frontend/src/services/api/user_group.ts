import { baseAPI } from '$lib';
import { AxiosError } from 'axios';
import type { UserGroup } from '../../model';

export const fetchUserGroups = async (username: string): Promise<UserGroup[]> => {
	try {
		const response = await baseAPI.get('/user_group', { params: { username } });
		if (response.status != 200) return [];
		return response.data['result'] as UserGroup[];
	} catch (error) {
		if (error instanceof AxiosError) {
			console.error(error.message);
		}
		console.error('failed to fetch user user_groups');
	}
	return [];
};

export const addGroup = async (usergroup: string, username?: string): Promise<UserGroup | null> => {
	try {
		const response = await baseAPI.post('/user_group/create', {
			username,
			usergroup
		});
		if (response.status == 200) {
			return response.data['result'];
		}
	} catch (error) {
		if (error instanceof AxiosError) {
			console.error(error.response?.data.message);
			console.error(error.message);
			throw error.response?.data.message;
		}
	}
	return null;
};
