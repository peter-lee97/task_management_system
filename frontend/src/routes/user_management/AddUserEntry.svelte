<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Account } from '../../model';
	import { validateEmail, validatePassword } from '$lib/validate';
	import { allStatus } from '$lib';

	export let groups: string[];

	const dispatch = createEventDispatcher<{
		click: { newAccount: Account; newGroup?: string };
	}>();

	let username: string;
	let password: string;
	let accountStatus = allStatus[0];
	let email: string | null;
	let newGroup: string | undefined;

	const onTapHandler = () => {
		const invalidMsg = validateEntry();
		if (invalidMsg) {
			alert(invalidMsg);
			return;
		}
		const payload: { newAccount: Account; newGroup?: string } = {
			newAccount: {
				accountStatus,
				password,
				username,
				...(email != null ? { email } : null)
			}
		};
		console.log(`newgroup: ${newGroup}`);
		if (newGroup) payload['newGroup'] = newGroup;

		dispatch('click', payload);
		clearEntry();
	};

	const clearEntry = () => {
		username = '';
		password = '';
		email = '';
		newGroup = undefined;
	};

	const validateEntry = (): String | null => {
		if (!username) return 'Username cannot be empty';
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
		<select bind:value={newGroup} name="Groups" class="create-user-form">
			<option selected value={undefined}></option>
			{#each Object.entries(groups) as [_, group]}
				<option value={group}>{group}</option>
			{/each}
		</select>
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
		padding: 0px 10px;
	}
	tr {
		border-bottom: 1px solid #eff4fa;
	}
</style>
