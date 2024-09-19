<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { authStore, isAdminReadable, logoutAccount } from '$lib/authStore';
	import { toast } from 'svelte-sonner';
	import EditProfileModal from './EditProfileModal.svelte';
	import { onDestroy } from 'svelte';

	$: account = $authStore;
	let showProfile = false;
	let currentPageName: string = '';

	const sub = authStore.subscribe((acc) => {
		console.log(`changes in account: ${acc != null}`);
		if (acc == null && browser) {
			goto('/login');
		}
	});

	onDestroy(() => {
		sub();
	});

	page.subscribe((p) => {
		currentPageName = p.url.pathname;
	});
</script>

<nav>
	{#if $authStore != null}
		<h1>
			Hello, {$authStore.username}
		</h1>
	{/if}
	<div>
		<button
			class="system-button"
			class:active={'/home/app_management' == currentPageName}
			on:click={() => {
				goto('/home/app_management');
				console.log('Application pressed');
			}}>Application</button
		>
		{#if $isAdminReadable}
			<button
				class="system-button"
				class:active={'/home/user_management' == currentPageName}
				on:click={() => {
					console.log('User Management');
					goto('/home/user_management');
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
	<div>
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
		<button
			class="logout-button"
			type="button"
			on:click={() => {
				logoutAccount();
				goto('/login');
			}}>Sign out</button
		>
	</div>
</nav>

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
