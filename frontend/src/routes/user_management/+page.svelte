<script lang="ts">
	import { onMount } from 'svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { groupStore } from '$lib/groupStore';
	import { validateAccount } from '$lib/authStore';
	import type { Account, UserGroup } from '../../model';
	import { fetchAllUsers, register, updateUser } from '../../services/api/auth';
	import { addGroup, fetchUserGroups } from '../../services/api/user_group';
	import Modal from '../../components/Modal.svelte';
	import UserRowEntry from '../../components/UserRowEntry.svelte';
	import AddUserEntry from './AddUserEntry.svelte';
	import NavBar from '../../components/NavBar.svelte';
	import ManagementBanner from '../../components/ManagementBanner.svelte';
	import AddGroupEntry from './AddGroupEntry.svelte';

	onMount(async () => {
		console.log(`onMount userManagement`);
		await validateAccount();

		const accounts = await fetchAllUsers();
		groupStore.fetch();
		accounts.forEach((acc) => {
			userAccounts[acc.username] = acc;
			fetchUserGroups(acc.username).then((groups) => {
				userGroups[acc.username] = groups;
			});
		});
	});
	let userAccounts: Record<string, Account> = {};
	let userGroups: Record<string, UserGroup[]> = {};
	let newGroupName: string | null;

	let showCreateGroup = false;

	function toggleShowGroup() {
		showCreateGroup = !showCreateGroup;
		console.log(`show group: ${showCreateGroup}`);
	}

	async function submitGroup() {
		if (newGroupName == null) return;
		console.log(`new group name: ${newGroupName}`);
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
					on:click={async (event) => {
						const newAccount = event.detail.newAccount;
						const newGroup = event.detail.newGroup;
						console.log(JSON.stringify(event.detail));
						try {
							const addedAccount = await register(newAccount);
							if (!addedAccount) return;
							userAccounts[addedAccount.username] = addedAccount;
							if (!newGroup) return;
							addGroup(newGroup, addedAccount.username).then(async (value) => {
								if (!value) return;
								userGroups[addedAccount.username] = await fetchUserGroups(addedAccount.username);
							});
						} catch (error) {
							if (error instanceof Error) {
								alert(error.message);
							}
						}
					}}
				/>
			{/if}
			{#each Object.entries(userAccounts) as [username, _]}
				<UserRowEntry
					bind:account={userAccounts[username]}
					bind:userGroups={userGroups[username]}
					on:notification={(event) => {
						fetchUserGroups(username).then((groups) => {
							userGroups = { ...userGroups, [username]: groups };
							if (event.detail.errorMessage) toast.error(event.detail.errorMessage);
							else if (event.detail.message) toast(event.detail.message);
						});
					}}
					on:submit={async (event) => {
						const newGroup = event.detail.newGroup;
						const newAccount = event.detail.newAccount;

						if (newAccount != null && Object.keys(newAccount).length > 1) {
							console.log(`Updating row: ${JSON.stringify(newAccount)}`);
							updateUser(newAccount).then((updatedAccount) => {
								console.log(`returned from Server: ${JSON.stringify(updatedAccount)}`);
								userAccounts = { ...userAccounts, [username]: updatedAccount };
								toast(`account ${newAccount.username} updated`);
							});
						}
						if (newGroup) {
							addGroup(newGroup, userAccounts[username].username).then(async (value) => {
								if (value == null) return;
								fetchUserGroups(username).then((groups) => {
									userGroups = { ...userGroups, [username]: groups };
									toast(`${value.user_group} added to ${value.username}`);
								});
							});
						}
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
		width: auto;
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
