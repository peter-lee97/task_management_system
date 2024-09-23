<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { groupStore } from '$lib/groupStore';
	import { writable } from 'svelte/store';
	import { validateGroup } from '$lib/validate';
	import { isAdminReadable, validateAccount } from '$lib/authStore';
	import type { Account, UserGroup } from '$models';
	import {
		addGroup,
		fetchUserGroups,
		removeFromGroup,
		fetchAllUsers,
		register,
		updateUser
	} from '$services';
	import Modal from '$components/Modal.svelte';
	import UserRowEntry from '$components/UserRowEntry.svelte';
	import ActionBanner from '$components/ManagementBanner.svelte';
	import AddUserEntry from '$components/AddUserEntry.svelte';
	import AddGroupEntry from '$components/AddGroupEntry.svelte';

	let userAccounts: Record<string, Account> = {};
	let userGroups = writable<Record<string, UserGroup[]>>();
	let newGroupName: string | null;

	let showCreateGroup = false;

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
			})
			.catch((err) => {
				toast.error(err);
				console.error(`Error adding new group: ${err}`);
			});
		groupStore.fetch();
	}
</script>

<Modal bind:showModal={showCreateGroup}>
	<AddGroupEntry bind:newGroupName submitHandler={submitGroup} cancelHandler={toggleShowGroup} />
</Modal>
<ActionBanner title="User Management">
	<button slot="action" type="button" on:click={toggleShowGroup}>+ Group</button>
</ActionBanner>

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
					on:submit={async (event) => {
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
		width: 100%;
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
