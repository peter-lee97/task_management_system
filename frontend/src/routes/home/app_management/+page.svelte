<script lang="ts">
	import ApplicationModal from '$components/ApplicationModal.svelte';
	import ApplicationEntry from '$components/ApplicationEntry.svelte';
	import ActionBanner from '$components/ManagementBanner.svelte';
	import { validateAccount } from '$lib/authStore';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { applicationStore, selectedIndexStore, userActionStore } from '$lib/appStore';
	import { Permit_Enum } from '$services';
	import type { Application } from '$models';

	let showCreateApp = false;
	let canCreateApp = false;

	let selectedApp: Application | null;
	let showApp = false;

	$: {
		if (!showApp) selectedApp = null;
	}

	onMount(async () => {
		await validateAccount();
		applicationStore.fetchApps();
		userActionStore.fetch();
		userActionStore.subscribe((values) => {
			canCreateApp = values.includes(Permit_Enum.CREATE_APP);
		});
	});

	onDestroy(() => {});
</script>

{#if canCreateApp}
	<ApplicationModal
		modalTitle={'Create Application'}
		showModal={showCreateApp}
		on:notification={(event) => {
			if (event.detail.message) toast(event.detail.message);
		}}
	/>
{/if}

{#if selectedApp != null}
	<ApplicationModal
		modalTitle={'Edit Application'}
		bind:showModal={showApp}
		bind:selectedApplication={selectedApp}
		on:notification={(event) => {
			if (event.detail.message) toast.success(event.detail.message);
		}}
	/>
{/if}

<ActionBanner title="App Management">
	<div slot="action">
		{#if canCreateApp}
			<button
				type="button"
				on:click={() => {
					showCreateApp = !showCreateApp;
				}}
			>
				+ Application
			</button>
		{/if}
	</div>
</ActionBanner>

<div class="application-grid">
	{#each $applicationStore as app, index}
		<ApplicationEntry
			{app}
			onEdit={canCreateApp
				? () => {
						selectedApp = app;
						showApp = true;
					}
				: null}
			onTap={() => {
				selectedIndexStore.set(index);
				goto('/home/app_management/kanban');
			}}
		/>
	{/each}
</div>

<style>
	button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
		padding: 10px;
		font-size: 16px;
		font-weight: 400;
	}

	.application-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr); /* Two columns */
		gap: 1rem; /* Space between items */
		overflow-y: auto; /* Enable vertical scrolling */
		padding: 1rem;
		border: 1px solid #ccc;
		background-color: #f9f9f9;
	}
</style>
