<script lang="ts">
	import { Toaster, toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { accountStore } from '../../store/auth';
	import { logout } from '../../services/api/auth';
	import { readonly } from 'svelte/store';
	import type { Account } from '../../model';
	import Modal from '../../components/Modal.svelte';
	import { addGroup } from '../../services/api/user_group';

	$: {
		readonly(accountStore).subscribe((value) => (account = value));
	}

	let account: Account | null;
</script>

<html lang="en">
	<body>
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
			<button
				class="system btn"
				on:click={() => {
					console.log('User Management');
					goto('/user_management');
				}}>User Management</button
			>
			<button
				on:click={() => {
					console.log('Edit Profile pressed');
				}}>Edit Profile</button
			>
			<button
				on:click|preventDefault={async () => {
					await logout();
					accountStore.set(null);
					goto('/');
				}}>Sign out</button
			>
		</nav>

		<h1>WIP: App Management</h1>
	</body>
</html>
