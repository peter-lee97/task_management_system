import { baseAPI } from '$lib';
import { AxiosError } from 'axios';
import type { Account } from '../../model';

export const login = async (
	username: string,
	password: string
): Promise<Record<string, unknown>> => {
	const headers = {
		'Content-Type': 'application/json'
	};
	try {
		const response = await baseAPI.post(
			'/auth/login',
			{
				username,
				password
			},
			{ headers }
		);
		return response.data;
	} catch (error) {
		if (error instanceof AxiosError) {
			console.log(error.code);
		}
		throw error;
	}
};

export const logout = async () => {
	console.log(`[logout]`);
	try {
		await baseAPI.post('/auth/logout');
	} catch (error) {
		console.error(`failed to logout: ${error}`);
	}
};

export const fetchUser = async (username?: string): Promise<Account | null> => {
	console.log('[fetchUser]');
	const response = await baseAPI.get(`/auth/`, {
		params: {
			username
		}
	});
	if (response.status != 200) return null;
	return response.data['result'] as Account | null;
};

export const fetchAllUsers = async (): Promise<Account[]> => {
	console.log('[fetchAllUsers]');
	const response = await baseAPI.get('/auth/all');
	if (response.status != 200) return [];
	return response.data['result'];
};
