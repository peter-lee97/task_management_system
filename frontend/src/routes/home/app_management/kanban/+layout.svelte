<script lang="ts">
	import { onMount } from 'svelte';
	import type { Application } from '$models';
	import { goto } from '$app/navigation';
	import EditProfileModal from '$components/EditProfileModal.svelte';
	import { toast } from 'svelte-sonner';
	import { applicationStore, selectedIndexStore } from '$lib/appStore';
	import { authStore, logoutAccount } from '$lib/authStore';
	onMount(() => {
		if ($selectedIndexStore == null || $applicationStore == null) {
			console.log(`return form here`);
			goto('/home/app_management');
			return;
		}
		currentApp = $applicationStore[$selectedIndexStore];
	});

	let currentApp: Application | undefined;
	let showProfile = false;
</script>

<nav>
	{#if currentApp}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="clickable-div" on:click={() => goto('/home/app_management')}>
			Application: {currentApp.App_Acronym}
		</div>
	{/if}
	<div>
		{#if $authStore}
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
	</div>
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
<slot />

<style>
	nav {
		padding: 20px 40px;
	}
	.system-button {
		background-color: inherit;
		border: none;
		cursor: pointer;
		display: inline-block;
		color: inherit;
		font-size: 16px;
	}

	.logout-button {
		color: white;
		border: none;
		background-color: inherit;
		cursor: pointer;
		padding: 10px;
		font-size: 16px;
	}
	.clickable-div:hover {
		cursor: pointer;
	}
</style>
