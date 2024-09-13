<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import { authStore } from '$lib/authStore';
	import type { Account } from '../model';
	import { updateUser } from '../services/api/auth';

	onMount(() => {
		if ($authStore) accountCopy = { ...$authStore };
	});

	export let showModal: boolean;
	let accountCopy: Account | null;

	const dispatch = createEventDispatcher<{ notification: { message: string } }>();

	async function submitHandler() {
		if (accountCopy == null) return;
		updateUser(accountCopy).then((updatedAccount) => {
			authStore.set(updatedAccount);
			dispatch('notification', {
				message: 'Profile successfully updated'
			});
			showModal = false;
		});
	}
</script>

<Modal bind:showModal>
	{#if accountCopy != null}
		<form title="Edit Profile" on:submit={submitHandler}>
			<div class="editable-profile-entries">
				<label for="username">Username</label>
				<div>{accountCopy.username}</div>
				<label for="email">Email</label>
				<input type="email" bind:value={accountCopy.email} />
				<label for="password">Password</label>
				<input type="password" placeholder="********" />
			</div>
			<button type="submit" on:submit|preventDefault={submitHandler}> Save Changes </button>
			<button type="button" on:click={() => (showModal = false)}>Cancel</button>
		</form>
	{:else}
		<h3>Account not found</h3>
	{/if}
</Modal>

<style>
	div.editable-profile-entries {
		display: grid;
		grid-template-columns: max-content max-content;
		grid-gap: 5px;
		margin: 20px 0;
	}
	div.editable-profile-entries label {
		text-align: left;
	}
</style>
