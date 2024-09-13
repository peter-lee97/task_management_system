<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { authStore, isAdminReadable, logoutAccount } from '$lib/authStore';
	import { Toaster, toast } from 'svelte-sonner';
	import EditProfileModal from './EditProfileModal.svelte';
	$: account = $authStore;

	let showProfile = false;

	authStore.subscribe((acc) => {
		console.log(`changes in account: ${acc != null}`);
		if (acc == null) {
			if (browser) {
				goto('/');
			}
		}
	});
</script>

<nav style="display:block">
	{#if account != null}
		<div>
			Hello {account.username}
		</div>
	{/if}
	<button
		class="system btn"
		on:click={() => {
			goto('/app_management');
			console.log('Application pressed');
		}}>Application</button
	>
	{#if $isAdminReadable}
		<button
			class="system btn"
			on:click={() => {
				console.log('User Management');
				goto('/user_management');
			}}>User Management</button
		>
	{/if}
	{#if account != null}
		<button
			on:click={() => {
				showProfile = !showProfile;
			}}
		>
			Edit Profile
		</button>
	{/if}
	<button
		on:click={() => {
			logoutAccount();
			goto('/');
		}}>Sign out</button
	>
</nav>
<EditProfileModal
	bind:showModal={showProfile}
	on:notification={(event) => {
		toast(event.detail.message);
	}}
></EditProfileModal>

<Toaster />
