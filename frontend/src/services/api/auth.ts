import { baseAPI } from '$lib';
import { AxiosError } from 'axios';
import type { Account } from '../../model';

export const login = async (username: string, password: string): Promise<Account> => {
	try {
		const response = await baseAPI.post('/auth/login', {
			username,
			password
		});
		return response.data['results'];
	} catch (error) {
		if (error instanceof AxiosError) {
			console.log(error.code);
		}
		throw error;
	}
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
			console.error(error.message);
			throw error.message;
		}
		throw 'failed to register user';
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

/// protected routes, use validateUser to check for user with cookie
export const fetchUser = async (username?: string): Promise<Account | null> => {
	console.log('[fetchUser]');
	try {
		const response = await baseAPI.get('/auth/users', {
			params: {
				username
			}
		});

		// if (response.status != 200) return null;
		return response.data['result'] as Account | null;
	} catch (error) {
		if (error instanceof AxiosError) {
			console.log(error.message);
		}
		throw error;
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
			console.log(error.message);
		}
		return [null, false];
	}
};

export const fetchAllUsers = async (): Promise<Account[]> => {
	console.log('[fetchAllUsers]');
	const response = await baseAPI.get('/auth/users');
	if (response.status != 200) return [];
	return response.data['result'];
};

export const updateUser = async (account: Account): Promise<Account> => {
	try {
		const response = await baseAPI.put('/auth/update', account, {
			params: { username: account.username }
		});
		if (response.status != 200) throw 'failed to update user';
		return response.data['result'];
	} catch (error) {
		if (!(error instanceof AxiosError)) {
			throw 'unable to update user';
		}
		console.error(error.message);
		throw error.message;
	}
};
