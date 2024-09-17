<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import '../app.css';
	import Modal from './Modal.svelte';
	import { authStore, checkAccountChange } from '$lib/authStore';
	import { updateUser } from '../services/api/auth';
	import type { AccountUpdate } from '../model/account';
	import { validateEmail, validatePassword } from '$lib/validate';

	onMount(() => {
		authStore.subscribe((a) => {
			if (a == null) {
				accountCopy = null;
				return;
			} else {
				accountCopy = { username: a?.username, email: a.email };
			}
		});
	});

	export let showModal: boolean;
	let accountCopy: AccountUpdate | null;

	const dispatch = createEventDispatcher<{
		notification: { message?: string; errorMessage?: string };
	}>();

	async function submitHandler() {
		if (accountCopy == null) return;

		if (accountCopy.email) {
			const errorMessage = validateEmail(accountCopy.email);
			if (errorMessage) {
				dispatch('notification', { errorMessage });
				return;
			}
		}

		if (accountCopy.password) {
			const errorMessage = validatePassword(accountCopy.password);
			if (errorMessage) {
				dispatch('notification', { errorMessage });
				return;
			}
		}

		// compare original and copy
		const isSame = checkAccountChange(accountCopy);
		if (isSame) {
			console.log('no changes in account');
			showModal = false;
			return;
		}

		await updateUser(accountCopy)
			.then((updatedAccount) => {
				authStore.set(updatedAccount);
				dispatch('notification', {
					message: 'Profile successfully updated'
				});
				showModal = false;
			})
			.catch((e) => {
				dispatch('notification', { errorMessage: String(e) });
				showModal = false;
			});
	}
</script>

<Modal bind:showModal>
	{#if accountCopy != null}
		<form class="edit-profile-form" title="Edit Profile" on:submit={submitHandler}>
			<h3 style="text-align: center;">Edit Profile</h3>
			<div class="editable-profile-entries">
				<div class="entry-component">
					<label for="username">Username</label>
					<div class="username-display input-component">{accountCopy.username}</div>
				</div>
				<div class="entry-component">
					<label for="email">Email</label>
					<input class="input-component" type="email" bind:value={accountCopy.email} />
				</div>
				<div class="entry-component">
					<label for="password">Password</label>
					<input
						class="input-component"
						type="password"
						placeholder="********"
						bind:value={accountCopy.password}
					/>
				</div>
			</div>
			<div class="form-buttons">
				<button type="submit" on:submit|preventDefault={submitHandler}>Save Changes</button>
				<button type="button" on:click={() => (showModal = false)}>Cancel</button>
			</div>
		</form>
	{:else}
		<h3>Account not found</h3>
	{/if}
</Modal>

<style>
	.edit-profile-form {
		padding: 10px 80px;
	}

	.editable-profile-entries {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 20px;
	}

	.entry-component {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	label {
		font-weight: 700;
		font-size: 15;
		width: 120px;
	}

	.input-component {
		font-weight: 400;
		font-size: 15;
		color: #646464;
	}

	.form-buttons {
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
		padding: 10px;
		width: 100%;
		font-size: 16px;
	}
</style>
