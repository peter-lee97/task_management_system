<script lang="ts">
	import Fa from 'svelte-fa';
	import { faEdit } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher, onMount } from 'svelte';

	import type { Account, UserGroup } from '../model';
	import UserGroupsEntry from './UserGroupsEntry.svelte';
	import { allStatus } from '$lib';
	import { groupStore } from '$lib/groupStore';
	import { compareAccount, validateEmail, validatePassword } from '$lib/validate';
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
	<td>
		{#if !isEditProfile}
			<button id="edit-button" on:click={toggleEdit}>
				<EditIcon />
			</button>
		{:else}
			<button type="submit" on:click={submitHandler}> Save Changes </button>
			<button type="button" on:click={toggleEdit}> Cancel </button>
		{/if}
	</td>
</tr>

<style>
	td {
		padding: 20px;
	}

	select {
		max-height: 100%;
	}

	tr {
		border-bottom: 1px solid #eff4fa;
	}

	#edit-button {
		background-color: inherit;
		border: 0px;
	}
	#edit-button:hover {
		background-color: inherit;
		border: 0px;
		cursor: pointer;
	}
</style>
