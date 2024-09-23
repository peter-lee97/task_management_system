import { baseAPI, unexpectedErrorMsg } from '$lib';
import { logoutAccount } from '$lib/authStore';
import { AxiosError } from 'axios';
import type { UserGroup } from '../../model';

export const fetchUserGroups = async (username: string): Promise<UserGroup[]> => {
	console.log('[fetchUserGroups]');
	try {
		const response = await baseAPI.get('/user_group', { params: { username } });
		if (response.status != 200) return [];
		return response.data['result'] as UserGroup[];
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.status == 401) {
				logoutAccount();
			} else {
				console.log(error.response?.data.message);
				throw error.response!.data['message'];
			}
		}
		throw unexpectedErrorMsg;
	}
};

export const fetchGroups = async (): Promise<string[]> => {
	console.log('[fetchGroups]');
	try {
		const response = await baseAPI.get('/user_group/groups');
		if (response.status != 200) return [];
		return response.data['result'];
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.status == 401) {
				logoutAccount();
			} else {
				console.log(error.response?.data.message);
				throw error.response!.data['message'];
			}
		}
		throw unexpectedErrorMsg;
	}
};

export const addGroup = async (usergroup: string, username?: string): Promise<UserGroup | null> => {
	console.log('[addGroup]');
	try {
		const response = await baseAPI.post('/user_group', {
			username,
			usergroup
		});

		if (response.status == 200) {
			return response.data['result'];
		}
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.status == 401) {
				logoutAccount();
			} else {
				console.log(error.response?.data.message);
				throw error.response!.data['message'];
			}
		}
		throw unexpectedErrorMsg;
	}
	return null;
};

export const removeFromGroup = async (usergroup: string, username: string) => {
	console.log('[removeFromGroup]');
	try {
		await baseAPI.delete('/user_group', {
			params: {
				username,
				usergroup
			}
		});
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.status == 401) {
				logoutAccount();
			} else {
				console.log(error.response?.data.message);
				throw error.response!.data['message'];
			}
		}
		throw unexpectedErrorMsg;
	}
};
