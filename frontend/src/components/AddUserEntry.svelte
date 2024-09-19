<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Account } from '$models';
	import { validateEmail, validatePassword, validateUsername } from '$lib/validate';
	import { allStatus } from '$lib';
	import UserGroupsEntry from '$components/UserGroupsEntry.svelte';

	export let groups: string[];

	const dispatch = createEventDispatcher<{
		submit: { newAccount: Account; newGroups?: string[] };
		notification: { message?: string; errorMessage?: string };
	}>();

	let username: string;
	let password: string;
	let accountStatus = allStatus[0];
	let email: string | null;
	let selectedGroup: string | null;
	let newGroups: string[] = [];

	const onTapHandler = () => {
		const invalidMsg = validateEntry();
		if (invalidMsg) {
			dispatch('notification', { errorMessage: invalidMsg! });
			return;
		}
		const payload: { newAccount: Account; newGroups?: string[] } = {
			newAccount: {
				accountStatus,
				password,
				username,
				...(email != null ? { email } : null)
			}
		};
		console.log(`newgroup: ${newGroups}`);
		if (newGroups.length > 0) payload['newGroups'] = newGroups;

		dispatch('submit', payload);
		clearEntry();
	};

	export const clearEntry = () => {
		username = '';
		password = '';
		email = '';
		newGroups = [];
	};

	const validateEntry = (): string | null => {
		if (!username) return 'Username cannot be empty';
		const invalidUserMsg = validateUsername(username);
		if (invalidUserMsg) return invalidUserMsg;
		const invalidPasswordMsg = validatePassword(password);
		if (invalidPasswordMsg) return invalidPasswordMsg;

		if (email != null && email.length > 0) {
			const invalidEmailMsg = validateEmail(email);
			if (invalidEmailMsg) return invalidEmailMsg;
		}

		return null;
	};
</script>

<tr>
	<td>
		<input bind:value={username} type="text" placeholder="myUsername" class="create-user-form" />
	</td>
	<td>
		<input
			bind:value={email}
			type="email"
			placeholder="example@mail.com"
			class="create-user-form"
		/>
	</td>
	<td>
		<select
			bind:value={selectedGroup}
			name="Groups"
			class="create-user-form"
			on:change={(_) => {
				if (selectedGroup == null) return;
				newGroups.push(selectedGroup);
				const set = new Set(newGroups);
				newGroups = Array.from(set.values());
				selectedGroup = null;
			}}
		>
			<option selected value={undefined}></option>
			{#each Object.entries(groups) as [_, group]}
				<option value={group}>{group}</option>
			{/each}
		</select>
		{#if newGroups.length > 0}
			<UserGroupsEntry
				canEdit={true}
				bind:groups={newGroups}
				on:select_group={(e) => {
					newGroups = [...newGroups.filter((v) => v != e.detail)];
				}}
			></UserGroupsEntry>
		{/if}
	</td>
	<td>
		<input bind:value={password} type="password" class="create-user-form" />
	</td>
	<td>
		<select name="Statuses">
			{#each Object.entries(allStatus) as [_, status]}
				<option value={status}>{status}</option>
			{/each}
		</select>
		<!-- <input bind:value={accountStatus} type="text" class="create-user-form" /> -->
	</td>
	<td><input type="submit" class="create-user-form" on:click|preventDefault={onTapHandler} /></td>
</tr>

<style>
	select {
		width: 100%;
		max-width: 100%;
		height: 30px;
		max-height: 100%;
		box-sizing: border-box;
		border: 0px;
	}
	td {
		min-height: 40px;
		padding: 4px 6px;
	}
	tr {
		border-bottom: 1px solid #eff4fa;
	}
</style>
