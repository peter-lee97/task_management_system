import { logoutAccount } from '$lib/authStore';
import type { Application, ApplicationUpdate } from '$models';
import {
	createApplication,
	fetchActions,
	fetchUserApplications,
	updateApplication
} from '$services';
import { AxiosError } from 'axios';
import { toast } from 'svelte-sonner';
import { writable } from 'svelte/store';

const _appsStore = () => {
	const store = writable<Application[]>([]);
	return {
		...store,
		fetchApps: async () => {
			await fetchUserApplications()
				.then((value) => {
					applicationStore.set(value);
				})
				.catch((e) => {
					if (e instanceof AxiosError) {
						if (e.status == 401) {
							logoutAccount();
						}
					}
					toast(e.response?.data.message ?? 'failed to fetch applications');
				});
		},
		create: async (newApp: Application) => {
			await createApplication(newApp)
				.then((result) => {
					if (result == null) return;
					store.update((e) => [...e, result]);
				})
				.catch((e) => {
					if (e instanceof AxiosError) {
						if (e.status == 401) {
							logoutAccount();
						}
					}
					toast.error(e.response?.data.message ?? 'failed to create application');
					throw 'failed to create application';
				});
		},
		updateApp: async (app: ApplicationUpdate) => {
			await updateApplication(app).then((result) => {
				if (result == null) return;
				store.update((values) => {
					const index = values.findIndex((e) => e.App_Acronym == result.App_Acronym);
					values[index] = result;
					return [...values];
				});
			});
		}
	};
};

const _userActionStore = () => {
	const store = writable<string[]>([]);
	return {
		...store,
		fetch: (appAcronym?: string) => {
			fetchActions(appAcronym)
				.then((value) => {
					store.set(value);
				})
				.catch((e) => {
					if (e instanceof AxiosError) {
						if (e.status == 401) {
							logoutAccount();
							return;
						}
						toast.error(e.response?.data.result);
					}
				});
		}
	};
};

export const selectedIndexStore = writable<number | null>();
export const userActionStore = _userActionStore();
export const applicationStore = _appsStore();
