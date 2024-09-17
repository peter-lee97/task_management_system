import { get, writable } from 'svelte/store';
import { fetchGroups } from '../services/api/user_group';

const _groupStore = () => {
	const store = writable<string[]>(new Array(0).fill(''));
	return {
		...store,
		// fetch from server
		fetch: () => {
			fetchGroups().then((groups) => {
				store.set(groups);
			});
		},
		getGroups: (): string[] => get(store)
	};
};

export const groupStore = _groupStore();
