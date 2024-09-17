<script lang="ts">
	import { onMount } from 'svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { groupStore } from '$lib/groupStore';
	import { isAdminReadable, validateAccount } from '$lib/authStore';
	import type { Account, UserGroup } from '../../model';
	import { fetchAllUsers, register, updateUser } from '../../services/api/auth';
	import { addGroup, fetchUserGroups, removeFromGroup } from '../../services/api/user_group';
	import Modal from '../../components/Modal.svelte';
	import UserRowEntry from '../../components/UserRowEntry.svelte';
	import AddUserEntry from './AddUserEntry.svelte';
	import NavBar from '../../components/NavBar.svelte';
	import ManagementBanner from '../../components/ManagementBanner.svelte';
	import AddGroupEntry from './AddGroupEntry.svelte';
	import { writable } from 'svelte/store';
	import { AxiosError } from 'axios';
	import { error } from '@sveltejs/kit';
	import { validateGroup } from '$lib/validate';

	let userAccounts: Record<string, Account> = {};
	let userGroups = writable<Record<string, UserGroup[]>>();
	let newGroupName: string | null;

	let showCreateGroup = false;
	let isLoaded = false;

	onMount(async () => {
		console.log(`onMount userManagement`);
		await validateAccount();

		if ($isAdminReadable) {
			const accounts = await fetchAllUsers();
			groupStore.fetch();
			const setup: Record<string, UserGroup[]> = {};
			accounts.forEach((acc) => {
				userAccounts[acc.username] = acc;
				setup[acc.username] = [];
			});

			userGroups.set(setup);
			accounts
				.map((a) => a.username)
				.forEach((username) => {
					fetchUserGroups(username).then((groups) => {
						userGroups.update((v) => {
							v[username] = groups;
							return { ...v };
						});
					});
				});
		}

		isLoaded = true;
	});

	function toggleShowGroup() {
		showCreateGroup = !showCreateGroup;
		console.log(`show group: ${showCreateGroup}`);
	}

	async function submitGroup() {
		if (newGroupName == null) return;
		const invalidGroupMessage = validateGroup(newGroupName);
		if (invalidGroupMessage) {
			toast.error(invalidGroupMessage);
			return;
		}
		await addGroup(newGroupName)
			.then((value) => {
				toast.success(`${value?.user_group} group added`);
				toggleShowGroup();
			})
			.catch((err) => {
				toast.error(err);
				console.error(`Error adding new group: ${err}`);
			});
		groupStore.fetch();
	}
</script>

<NavBar />
<Modal bind:showModal={showCreateGroup}>
	<AddGroupEntry bind:newGroupName submitHandler={submitGroup} cancelHandler={toggleShowGroup} />
</Modal>
<ManagementBanner title="User Management">
	<button slot="action" type="button" on:click={toggleShowGroup}>+ Group</button>
</ManagementBanner>
<Toaster />
<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> Username </th>
				<th> Email </th>
				<th> Group </th>
				<th> Password </th>
				<th> Status </th>
				<th> Action </th>
			</tr>
		</thead>
		<tbody>
			{#if groupStore.getGroups()}
				<AddUserEntry
					groups={$groupStore}
					on:notification={(event) => {
						if (event.detail.errorMessage) {
							toast.error(event.detail.errorMessage);
						} else if (event.detail.message) {
							toast.message(event.detail.message);
						}
					}}
					on:click={async (event) => {
						const newAccount = event.detail.newAccount;
						const newGroups = event.detail.newGroups;
						try {
							let addedAccount = await register(newAccount);
							if (!addedAccount) return;
							userAccounts[addedAccount.username] = addedAccount;
							if (!newGroups) return;
							newGroups.forEach((e) => {
								addGroup(e, addedAccount.username)
									.then(async (value) => {
										if (!value) return;
										const addedGroups = await fetchUserGroups(addedAccount.username);
										userGroups.update((v) => {
											v[addedAccount.username] = addedGroups;
											return { ...v };
										});
									})
									.catch((e) => toast.error(String(e)));
							});
						} catch (error) {
							toast.error(String(error));
						}
					}}
				/>
			{/if}
			{#each Object.entries(userAccounts) as [username, _]}
				<UserRowEntry
					bind:account={userAccounts[username]}
					bind:currentGroups={$userGroups[username]}
					on:notification={(event) => {
						fetchUserGroups(username).then((groups) => {
							userGroups = { ...userGroups, [username]: groups };
							if (event.detail.errorMessage) toast.error(event.detail.errorMessage);
							else if (event.detail.message) toast(event.detail.message);
						});
					}}
					on:submit={async (event) => {
						const addGroups = event.detail.newGroups;
						const removeGroups = event.detail.removeGroups;
						const newAccount = event.detail.newAccount;

						if (newAccount != null && Object.keys(newAccount).length > 1) {
							await updateUser(newAccount)
								.then((updatedAccount) => {
									if (updatedAccount == null) return;
									userAccounts = { ...userAccounts, [username]: updatedAccount };
									toast.success(`account ${newAccount.username} updated`);
									console.log(`row updated: ${JSON.stringify(updatedAccount)}`);
								})
								.catch((e) => toast.error(e));
						}

						if (addGroups) {
							await Promise.all(addGroups.map((e) => addGroup(e, username)));
						}
						if (removeGroups) {
							await Promise.all(removeGroups.map((g) => removeFromGroup(g, username)));
						}
						fetchUserGroups(username)
							.then((groups) => {
								console.log(`[groups] from server: ${JSON.stringify(groups)} | ${username}`);
								userGroups.update((v) => {
									v[username] = groups;
									return { ...v };
								});
							})
							.catch((e) => {
								toast.error(e);
							});
					}}
				/>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		margin-left: auto;
		margin-right: auto;
		width: 90%;
		border-collapse: collapse;
	}
	thead {
		background-color: aliceblue;
	}

	thead > tr th {
		padding: 20px 0px;
		color: #8f9bb3;
		font-weight: 600;
		font-size: 15;
	}
	button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
		padding: 10px;
		font-size: 16px;
		font-weight: 400;
	}
</style>
