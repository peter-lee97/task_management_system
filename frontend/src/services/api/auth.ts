import { goto } from '$app/navigation';
import { baseAPI, unexpectedErrorMsg } from '$lib';
import { logoutAccount } from '$lib/authStore';
import type { Account, AccountUpdate } from '$models';
import { AxiosError } from 'axios';

export const login = async (username: string, password: string): Promise<Account> => {
	const response = await baseAPI.post('/auth/login', {
		username,
		password
	});
	return response.data['result'];
};

export const register = async (account: Account): Promise<Account | null> => {
	try {
		const response = await baseAPI.post('/auth/admin/register', {
			...(account.email != null ? { email: account.email } : null),
			username: account.username,
			password: account.password,
			accountStatus: account.accountStatus
		});
		if (response.status != 200) return null;
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

export const logout = () => {
	console.log(`[logout]`);
	try {
		baseAPI.post('/auth/logout');
	} catch (error) {
		console.error(`failed to logout: ${error}`);
		goto('/login');
	}
};

/// protected routes, use validateUser to check for user with cookie
export const fetchUser = async (username?: string): Promise<Account | null> => {
	console.log('[fetchUser]');
	try {
		const response = await baseAPI.post('/auth/fetchUsers', {
			username
		});
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

export const validateUser = async (): Promise<[Account | null, boolean]> => {
	console.log('[validate]');
	try {
		const response = await baseAPI.get('/auth/validate');
		if (response.status == 200) {
			console.log('isadmin: ', response.data['isAdmin']);
			return [response.data['result'] as Account, response.data['isAdmin'] ?? false];
		}
		return [null, false];
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

export const fetchAllUsers = async (): Promise<Account[]> => {
	console.log('[fetchAllUsers]');
	try {
		const response = await baseAPI.post('/auth/fetchUsers');
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

export const updateUser = async (account: AccountUpdate): Promise<Account | null> => {
	try {
		const response = await baseAPI.post('/auth/updateUser', account);

		if (response.status != 200) return null;
		return response.data['result'];
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.status == 401) {
				logoutAccount();
			}
			throw error.response!.data['message'];
		} else {
			throw unexpectedErrorMsg;
		}
	}
};
