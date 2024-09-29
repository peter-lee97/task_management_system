import type { Account, AccountUpdate, UserGroup } from '$models';
import { fetchUserGroups, logout, validateUser } from '$services';
import { get, readable, writable } from 'svelte/store';

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

/**
 * compare fields that can be changed by user
 * @param update
 * @returns
 */
export const checkAccountChange = (update: AccountUpdate): boolean => {
	const current = get(authStore);
	if (current?.email !== update.email) return false;
	if (update.password !== null && update.password !== undefined) return false;
	return true;
};

export const validateAccount = async () => {
	const [newAccount, isAdmin] = await validateUser();
	isAdminWritable.set(isAdmin);
	authStore.set(newAccount);
};

export const logoutAccount = () => {
	logout();
	setAccount(null);
};

export const userGroupStore = readable(new Array<UserGroup>(0), (set) => {
	const sub = authStore.subscribe((auth) => {
		if (!auth) {
			set([]);
		} else {
			fetchUserGroups(auth.username).then((result) => {
				set(result);
			});
		}
	});
	return () => {
		sub();
	};
});
