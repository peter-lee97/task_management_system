<script lang="ts">
	import { groupStore } from '$lib/groupStore';
	import { validateApplication } from '$lib/validate';
	import type { Application, ApplicationUpdate } from '$models';
	import { addDays, fromDateString, toDateString } from '$services';
	import { createEventDispatcher, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { applicationStore } from '$lib/appStore';
	import Modal from './Modal.svelte';

	export let showModal: boolean;
	export let modalTitle: string;
	// Optional value
	export let selectedApplication: Application | undefined = undefined;

	let errorMessage: string | null;

	const today = new Date();

	let appAcronym: string | undefined;
	let appRNumber: number | undefined;
	let appDescription: string | null;
	let appStartDate = toDateString(today.valueOf());
	let appEndDate = toDateString(addDays(today, 60).valueOf());
	let appPermitCreate: string | null;
	let appPermitOpen: string | null;
	let appPermitToDo: string | null;
	let appPermitDoing: string | null;
	let appPermitDone: string | null;

	const dispatch = createEventDispatcher<{
		notification: { message?: string; errorMessage?: string };
	}>();

	onMount(() => {
		groupStore.fetch();
		// Populate the fields with the `selectedApplication`
		if (selectedApplication) {
			appAcronym = selectedApplication.App_Acronym;
			appRNumber = selectedApplication.App_Rnumber;
			appDescription = selectedApplication.App_Description;
			appStartDate = toDateString(selectedApplication.App_startDate * 1000);
			appEndDate = toDateString(selectedApplication.App_endDate * 1000);
			appPermitCreate = selectedApplication.App_permit_Create;
			appPermitOpen = selectedApplication.App_permit_Open;
			appPermitToDo = selectedApplication.App_permit_toDoList;
			appPermitDoing = selectedApplication.App_permit_Doing;
			appPermitDone = selectedApplication.App_permit_Done;
			console.log(`create: ${appPermitCreate} | open: ${appPermitOpen}`);
		}
	});

	const clearFields = () => {
		appAcronym = undefined;
		appRNumber = undefined;
		appDescription = null;
		appStartDate = toDateString(today.valueOf());
		appEndDate = toDateString(addDays(today, 14).valueOf());
		appPermitCreate = null;
		appPermitOpen = null;
		appPermitToDo = null;
		appPermitDoing = null;
		appPermitDone = null;
	};

	function submitHandler() {
		errorMessage = validateApplication({
			appAcronym,
			rNumber: appRNumber,
			endDate: appEndDate,
			startDate: appStartDate
		});
		if (errorMessage != null) {
			toast.error(errorMessage);
			return;
		}
		if (selectedApplication) {
			let startDate;
			let endDate;
			if (appStartDate !== toDateString(selectedApplication.App_startDate * 1000)) {
				startDate = fromDateString(appStartDate);
			}
			if (appEndDate !== toDateString(selectedApplication.App_endDate * 1000)) {
				endDate = fromDateString(appEndDate);
			}

			const updateApp: ApplicationUpdate = {
				App_Acronym: selectedApplication.App_Acronym,
				App_Description:
					appDescription !== selectedApplication.App_Description ? appDescription : undefined,
				App_startDate: startDate,
				App_endDate: endDate,
				App_permit_Create:
					appPermitCreate !== selectedApplication.App_permit_Create ? appPermitCreate : undefined,
				App_permit_Open:
					appPermitOpen !== selectedApplication.App_permit_Open ? appPermitOpen : undefined,
				App_permit_toDoList:
					appPermitToDo !== selectedApplication.App_permit_toDoList ? appPermitToDo : undefined,
				App_permit_Doing:
					appPermitDoing !== selectedApplication.App_permit_Doing ? appPermitDoing : undefined,
				App_permit_Done:
					appPermitDone !== selectedApplication.App_permit_Done ? appPermitDone : undefined
			};

			applicationStore.updateApp(updateApp).then(() => {
				dispatch('notification', { message: `${appAcronym} updated` });
				clearFields();
				showModal = false;
			});
		} else {
			const newApp: Application = {
				App_Acronym: appAcronym!,
				App_Description: appDescription,
				App_startDate: fromDateString(appStartDate),
				App_Rnumber: appRNumber!,
				App_endDate: fromDateString(appEndDate),
				App_permit_Create: appPermitCreate,
				App_permit_Open: appPermitOpen,
				App_permit_toDoList: appPermitToDo,
				App_permit_Doing: appPermitDoing,
				App_permit_Done: appPermitDone
			};

			applicationStore.create(newApp).then(() => {
				dispatch('notification', { message: `${appAcronym} created successfully` });
				clearFields();
				showModal = false;
			});
		}
	}
</script>

<Modal bind:showModal>
	<div class="modal-wrapper">
		<h1 style="text-align: center">{modalTitle}</h1>
		<div>
			<div class="entry-row">
				<div class="title">App_Acronym</div>
				<div class="content">
					{#if selectedApplication}
						{appAcronym}
					{:else}
						<input type="text" bind:value={appAcronym} />
					{/if}
				</div>
			</div>
			<div class="entry-row">
				<div class="title">App_Rnumber</div>
				<div class="content">
					{#if selectedApplication}
						{appRNumber}
					{:else}
						<input type="number" bind:value={appRNumber} placeholder="positive integers" min="0" />
					{/if}
				</div>
			</div>
			<div class="entry-row">
				<div class="title">App_Description</div>
				<textarea class="content" name="app-description" rows="12" bind:value={appDescription} />
			</div>
			<div class="entry-row">
				<div class="title">App_startDate</div>
				<input class="content" type="date" bind:value={appStartDate} />
			</div>
			<div class="entry-row">
				<div class="title">App_endDate</div>
				<input class="content" type="date" bind:value={appEndDate} />
			</div>

			<div class="entry-row">
				<div class="title">App_permit_Create</div>
				<select class="content" name="app-permit-create" bind:value={appPermitCreate}>
					<option value={null} selected disabled>Select Group</option>
					{#each Object.entries(groupStore.getGroups()) as [_, group]}
						<option value={group}> {group}</option>
					{/each}
				</select>
			</div>
			<div class="entry-row">
				<div class="title">App_permit_Open</div>
				<select class="content" name="app-permit-open" bind:value={appPermitOpen}>
					<option value={null} selected disabled>Select Group</option>
					{#each Object.entries(groupStore.getGroups()) as [_, group]}
						<option value={group}> {group}</option>
					{/each}
				</select>
			</div>
			<div class="entry-row">
				<div class="title">App_permit_toDoList</div>
				<select class="content" name="app-permit-todo" bind:value={appPermitToDo}>
					<option value={null} selected disabled>Select Group</option>
					{#each Object.entries(groupStore.getGroups()) as [_, group]}
						<option value={group}> {group}</option>
					{/each}
				</select>
			</div>
			<div class="entry-row">
				<div class="title">App_permit_Doing</div>
				<select class="content" name="app-permit-doing" bind:value={appPermitDoing}>
					<option value={null} selected disabled>Select Group</option>
					{#each Object.entries(groupStore.getGroups()) as [_, group]}
						<option value={group}> {group}</option>
					{/each}
				</select>
			</div>
			<div class="entry-row">
				<div class="title">App_permit_Done</div>
				<select class="content" name="app-permit-done" bind:value={appPermitDone}>
					<option value={null} selected disabled>Select Group</option>
					{#each Object.entries(groupStore.getGroups()) as [_, group]}
						<option value={group}> {group}</option>
					{/each}
				</select>
			</div>

			<div class="entry-row inputs">
				<button on:click={submitHandler}> Submit </button>
				<button on:click={() => (showModal = !showModal)}> Cancel </button>
			</div>
		</div>
	</div>
</Modal>

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
	.entry-row {
		display: flex;
		gap: 10px;
		width: 100%;
		align-items: center;
		margin: 8px 0px;
	}

	.title {
		min-height: 2em;
		flex: 3;
	}

	.content {
		flex: 8;
	}

	.entry-row.inputs {
		margin-top: 10px;
		justify-content: center;
		align-items: center;
		display: flex;
		gap: 20px;
	}

	.modal-wrapper {
		padding: 8px;
		min-width: 800px;
	}
</style>
