<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fetchAllUsers } from '../../services/api/auth';
	import type { Account, UserGroup } from '../../model';
	import { addGroup, fetchUserGroups } from '../../services/api/user_group';
	import Modal from '../../components/Modal.svelte';
	import { toast, Toaster } from 'svelte-sonner';

	onMount(async () => {
		const accounts = await fetchAllUsers();

		accounts.forEach((acc) => {
			accountObj[acc.username] = acc;
			fetchUserGroups(acc.username).then((groups) => {
				userGroups[acc.username] = groups;
			});
		});
	});
	const accountObj: Record<string, Account> = {};
	const userGroups: Record<string, UserGroup[]> = {};
	let newGroupName = '';

	let showCreateGroup = false;

	function toggleShowGroup() {
		showCreateGroup = !showCreateGroup;
		console.log(`show group: ${showCreateGroup}`);
	}

	function submitGroup() {
		console.log(`new group name: ${newGroupName}`);
		addGroup(newGroupName)
			.then((value) => {
				toast.success(`${value} group added`);
				toggleShowGroup();
			})
			.catch((err) => {
				toast.error(err);
				console.error(`Error adding new group: ${err}`);
			});
	}
</script>

<html lang="en">
	<nav>
		<button
			on:click={() => {
				goto('/app_management');
			}}
		>
			Application
		</button>
	</nav>
	<Modal bind:showModal={showCreateGroup}>
		<form on:submit={submitGroup}>
			<h3>Add Group</h3>
			<label for="groupNameInput">Group Name</label>
			<input bind:value={newGroupName} type="text" id="groupNameInput" required />
			<input type="submit" value="Add" disabled={newGroupName.length == 0} />
			<input type="button" value="Cancel" on:click={toggleShowGroup} />
		</form>
	</Modal>
	<div>
		<h2>Application Management</h2>
		<button class="add group button" on:click={toggleShowGroup}>+ Group</button>
	</div>
	<Toaster />

	{#each Object.entries(accountObj) as [username, account]}
		<h3>{username}</h3>
		<p>
			Email: {account.email} | Password {account.password} | {account.accountStatus}
		</p>
		<h4>
			Groups:
			{#if userGroups[username]}
				{#each Object.entries(userGroups[username]) as [_, group]}
					{group.user_group}
				{/each}
			{/if}
		</h4>
	{/each}
</html>
