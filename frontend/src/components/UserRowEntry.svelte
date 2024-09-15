<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { allStatus } from '$lib';
	import { groupStore } from '$lib/groupStore';
	import { validateEmail, validatePassword } from '$lib/validate';
	import '../app.css';
	import type { Account, UserGroup } from '../model';
	import UserGroupsEntry from './UserGroupsEntry.svelte';
	import { removeFromGroup } from '../services/api/user_group';
	import EditIcon from './icons/EditIcon.svelte';
	import type { AccountUpdate } from '../model/account';

	export let account: Account;
	export let userGroups: UserGroup[] | null;

	onMount(() => {});

	$: {
		if (!isEditProfile) resetEntries();
	}

	let isEditProfile: boolean = false;

	// possible new changes
	let newEmail: string | undefined;
	let newGroup: string | null;
	let newPassword: string | null;
	let newStatus: string = account.accountStatus;

	const eventDispatcher = createEventDispatcher<{
		submit: {
			newAccount?: AccountUpdate;
			newGroup?: string | null;
		};
		notification: { message?: string; errorMessage?: string };
	}>();

	function submitHandler() {
		const payload: {
			newAccount?: AccountUpdate;
			newGroup?: string | null;
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

		if (userGroups != null && newGroup) {
			const groupExists = userGroups.map((g) => g.user_group).includes(newGroup);
			if (!groupExists) payload['newGroup'] = newGroup;
		}

		const called = eventDispatcher('submit', {
			...payload,
			newAccount: {
				username: account.username,
				...(newEmail != null ? { email: newEmail } : undefined),
				...(newPassword != null ? { password: newPassword } : undefined),
				...(account.accountStatus != newStatus ? { accountStatus: newStatus } : undefined)
			}
		});

		if (called) isEditProfile = false;
	}

	function resetEntries() {
		newEmail = account.email ?? undefined;
		newGroup = null;
		newPassword = null;
		newStatus = account.accountStatus;
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
			<select bind:value={newGroup} name="Groups">
				<option selected value="null" placeholder="none" />
				{#each Object.entries(groupStore.getGroups()) as [_, entry]}
					<option value={entry}>{entry}</option>
				{/each}
			</select>
			<br />
		{/if}
		{#if userGroups != null}
			<UserGroupsEntry
				bind:groups={userGroups}
				on:select_group={(value) => {
					removeFromGroup(value.detail.username, value.detail.user_group).then(() => {
						eventDispatcher('notification', {
							message: `${value.detail.user_group} removed successfully`
						});
					});
				}}
			/>
		{/if}
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
