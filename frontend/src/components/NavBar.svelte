<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { authStore, isAdminReadable, logoutAccount } from '$lib/authStore';
	import { Toaster, toast } from 'svelte-sonner';
	import EditProfileModal from './EditProfileModal.svelte';
	import { onDestroy } from 'svelte';

	$: account = $authStore;

	let showProfile = false;

	const sub = authStore.subscribe((acc) => {
		console.log(`changes in account: ${acc != null}`);
		if (acc == null && browser) {
			goto('/login');
		}
	});

	onDestroy(() => {
		sub();
	});

	let isPath = (name: string): boolean => {
		return $page.url.pathname === name;
	};
</script>

<nav>
	{#if account != null}
		<h1>
			Hello, {account.username}
		</h1>
	{/if}
	<div>
		<button
			class="system-button"
			class:active={isPath('/app_management')}
			on:click={() => {
				goto('/app_management');
				console.log('Application pressed');
			}}>Application</button
		>
		{#if $isAdminReadable}
			<button
				class="system-button"
				class:active={isPath('/user_management')}
				on:click={() => {
					console.log('User Management');
					goto('/user_management');
				}}>User Management</button
			>
		{/if}
	</div>
	{#if account != null}
		<button
			class="system-button profile"
			on:click={() => {
				showProfile = !showProfile;
			}}
		>
			Edit Profile
		</button>
	{/if}
	<button
		class="logout-button"
		type="button"
		on:click={() => {
			logoutAccount();
			goto('/login');
		}}>Sign out</button
	>
</nav>
<EditProfileModal
	bind:showModal={showProfile}
	on:notification={(event) => {
		if (event.detail.message) {
			toast.info(event.detail.message);
		} else if (event.detail.errorMessage) {
			console.error(`error from edit profile: ${event.detail.errorMessage}`);
			toast.error(event.detail.errorMessage);
		}
	}}
/>

<Toaster />

<style>
	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		background-color: black;
		color: whitesmoke;
	}

	.logout-button {
		color: white;
		border: none;
		background-color: inherit;
		cursor: pointer;
		padding: 10px;
		font-size: 16px;
	}

	.system-button {
		background-color: inherit;
		border: none;
		cursor: pointer;
		display: inline-block;
		color: inherit;
		font-size: 20px;
	}

	.profile {
		text-decoration: underline;
		font-size: 16px;
	}

	button.active {
		text-decoration: underline;
	}
</style>
