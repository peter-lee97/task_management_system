import { readable, writable } from 'svelte/store';
import type { Account } from '../model';
import { logout, validateUser } from '../services/api/auth';

export const authStore = writable<Account | null>();

const _isAdmin = false;

const isAdminWritable = writable(_isAdmin);

// Create a readable store for isAdmin that can only be read externally
export const isAdminReadable = readable(false, (set) => {
	// Internal function to update admin status when validateAccount is called
	const sub = isAdminWritable.subscribe((change) => {
		set(change);
	});

	return () => {
		// Cleanup if necessary
		sub();
	};
});

export const setAccount = (account: Account | null) => {
	authStore.set(account);
};

export const validateAccount = async () => {
	const [newAccount, isAdmin] = await validateUser();
	isAdminWritable.set(isAdmin);
	authStore.set(newAccount);
};

export const logoutAccount = async () => {
	await logout();
	setAccount(null);
};
