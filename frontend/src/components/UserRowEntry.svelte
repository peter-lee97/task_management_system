<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { allStatus } from '$lib';
	import { groupStore } from '$lib/groupStore';
	import { writable } from 'svelte/store';
	import { validateEmail, validatePassword } from '$lib/validate';

	import type { Account, UserGroup, AccountUpdate } from '$models';
	import UserGroupsEntry from '$components/UserGroupsEntry.svelte';
	import EditIcon from '$components/icons/EditIcon.svelte';
	import '../app.css';

	export let account: Account;
	export let currentGroups: UserGroup[] | undefined;

	$: if (!isEditProfile) resetEntries();

	let isEditProfile: boolean = false;

	// possible new changes
	let newEmail: string | null;
	let newGroup: string | null;
	let newPassword: string | null;
	let newStatus: string = account.accountStatus;

	let currentGroupCopy = writable<string[]>();

	$: {
		if (currentGroups != null) {
			currentGroupCopy.set(currentGroups.map((v) => v.user_group));
		}
	}

	const eventDispatcher = createEventDispatcher<{
		submit: {
			newAccount?: AccountUpdate;
			newGroups?: string[];
			removeGroups?: string[];
		};
		notification: { message?: string; errorMessage?: string };
	}>();

	function submitHandler() {
		const payload: {
			newAccount?: AccountUpdate;
			newGroups?: string[];
			removeGroups?: string[];
		} = {};

		if (newPassword) {
			const errorMessage = validatePassword(newPassword);
			if (errorMessage) {
				eventDispatcher('notification', { errorMessage });
				return;
			}
		}

		if (newEmail) {
			const errorMessage = validateEmail(newEmail);
			if (errorMessage) {
				eventDispatcher('notification', { errorMessage });
				return;
			}
		}

		const originalGroupSet = new Set(
			currentGroups != null ? currentGroups?.map((v) => v.user_group) : []
		);
		const copyGroupSet = new Set($currentGroupCopy);

		const toRemove = Array.from(originalGroupSet.values()).filter((e) => !copyGroupSet.has(e));
		const toAdd = Array.from(copyGroupSet.values()).filter((e) => !originalGroupSet.has(e));

		if (toRemove.length > 0) payload.removeGroups = toRemove;
		if (toAdd.length > 0) payload.newGroups = toAdd;

		const called = eventDispatcher('submit', {
			...payload,
			newAccount: {
				username: account.username,
				...(newEmail ? { email: newEmail } : undefined),
				...(newPassword != null ? { password: newPassword } : undefined),
				...(account.accountStatus != newStatus ? { accountStatus: newStatus } : undefined)
			}
		});

		if (called) isEditProfile = false;
	}

	function resetEntries() {
		newEmail = null;
		newPassword = null;
		newStatus = account.accountStatus;
		currentGroupCopy.set(currentGroups ? currentGroups!.map((e) => e.user_group) : []);
	}

	function toggleEdit() {
		isEditProfile = !isEditProfile;
	}
</script>

<tr>
	<td>{account.username}</td>
	<td>
		{#if !isEditProfile && account.email}
			{account.email}
		{:else if isEditProfile}
			<input bind:value={newEmail} placeholder={account.email} type="email" />
		{/if}
	</td>
	<td id="groups-row-entry" align="center">
		{#if isEditProfile}
			<select
				bind:value={newGroup}
				name="Groups"
				on:change={(_) => {
					if (newGroup != null) {
						currentGroupCopy.update((store) => {
							if (!store.includes(String(newGroup))) {
								store.push(String(newGroup));
							}
							return [...store];
						});
						newGroup = null;
					}
				}}
			>
				<option selected value="null" placeholder="none" />
				{#each Object.entries($groupStore) as [_, entry]}
					<option value={entry}>{entry} </option>
				{/each}
			</select>
			<br />
		{/if}

		<UserGroupsEntry
			bind:groups={$currentGroupCopy}
			bind:canEdit={isEditProfile}
			on:select_group={(event) => {
				const groupname = event.detail;
				currentGroupCopy.update((v) => {
					return [...v.filter((v) => v != groupname)];
				});
			}}
		/>
	</td>
	<td id="password-row-entry">
		{#if !isEditProfile}
			********
		{:else}
			<input type="password" bind:value={newPassword} />
		{/if}</td
	>
	<td id="accountstatus-row-entry">
		{#if !isEditProfile}
			{account.accountStatus}
		{:else}
			<select bind:value={newStatus}>
				{#each Object.entries(allStatus) as [_, status]}
					<option value={status}>{status}</option>
				{/each}
			</select>
		{/if}
	</td>
	<td width="100px" style="align-content: center;">
		{#if !isEditProfile}
			<button class="action-button edit" on:click={toggleEdit}>
				<EditIcon />
			</button>
		{:else}
			<div class="edit-actions">
				<button class="action-button" type="submit" on:click|preventDefault={submitHandler}>
					Save Changes
				</button>
				<button class="action-button" type="button" on:click={toggleEdit}> Cancel </button>
			</div>
		{/if}
	</td>
</tr>

<style>
	td {
		padding: 4px 6px;
	}

	select {
		width: 100%;
		max-width: 100%;
		height: 30px;
		max-height: 100%;
		box-sizing: border-box;
		border: 0px;
	}

	tr {
		border-bottom: 1px solid #eff4fa;
	}
	.action-button {
		color: white;
		background-color: black;
		font-size: 10;
		font-weight: 400;
		width: 100%;
		padding: 4px 0px;
		cursor: pointer;
	}

	.edit-actions {
		height: 60px;
		display: block;
		width: 100%;
	}

	.edit {
		background-color: inherit;
		border: 0px;
	}
	.edit:hover {
		background-color: inherit;
		border: 0px;
	}
</style>
