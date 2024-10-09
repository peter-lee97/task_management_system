<script lang="ts">
	import Modal from '$components/Modal.svelte';
	import { authStore, logoutAccount } from '$lib/authStore';
	import type { Application, Plan, Task, TaskInsert, TaskUpdate } from '$models';
	import {
		Context_Key,
		createTask,
		Permit_Enum,
		Task_State,
		toDateString,
		updateTask
	} from '$services';
	import { AxiosError } from 'axios';
	import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { get, type Readable, type Writable } from 'svelte/store';
	import TaskNotesComponent from './TaskNotesComponent.svelte';

	export let showModal: boolean;
	export let currentApp: Application;
	export let selectedTaskId: string | undefined = undefined;

	const dispatch = createEventDispatcher<{ notification: { newTask?: Task; updateTask?: Task } }>();

	// For creating new task
	let newTaskName: string;
	let newTaskDescription: string | null;
	let newTaskPlan: string | null;
	let newTaskNotes: string | null;
	let newTaskState: string;
	let newCreateDate = new Date();
	let newCreateDateString = toDateString(newCreateDate.valueOf());

	let task: Task | undefined = undefined;
	let canAddComment = false;

	let availablePlans: string[] = [];
	let writablePlans = getContext<Writable<Record<string, Plan>>>(Context_Key.PLAN);
	let writableTasks = getContext<Readable<Task[]>>(Context_Key.TASK);
	$: actions = getContext<Writable<string[]>>(Context_Key.ACTIONS);

	$: {
		if (task) {
			canAddComment = $actions.includes(task.Task_state);
		} else {
			// task creation
			canAddComment = $actions.includes(Permit_Enum.CREATE_TASK);
		}
	}

	$: {
		console.log(`current selected plan: ${newTaskPlan}`);
	}

	onMount(() => {
		const p = get(writablePlans);
		availablePlans = Object.entries(p).map((e) => e[0]);
		if (selectedTaskId) {
			writableTasks.subscribe((e) => {
				const index = $writableTasks.findIndex((e) => e.Task_id == selectedTaskId);
				if (index == -1) {
					console.log('index not found');
					return;
				}
				task = e[index];
				newTaskPlan = task.Task_plan;
				newTaskState = task.Task_state;
			});
		}
	});

	const updateHandler = () => {
		if (!task) throw 'Task not found';
		const taskUpdate: TaskUpdate = {
			Task_app_Acronym: task.Task_app_Acronym,
			Task_id: task.Task_id,
			Task_state: newTaskState != task.Task_state ? newTaskState : task.Task_state,
			Task_plan: newTaskPlan != task.Task_plan ? newTaskPlan : undefined,
			Task_notes: newTaskNotes ? newTaskNotes : undefined
		};

		// only concern about plan and notes
		if (
			!taskUpdate.Task_plan &&
			!newTaskNotes &&
			task.Task_state == newTaskState &&
			task.Task_plan == newTaskPlan
		) {
			toast.info('no changes in task');
			return;
		}

		updateTask(taskUpdate)
			.then((t) => {
				if (t == null) return toast.error('Task not update. Please try again');
				toast.success(`Task updated (${t.Task_id})`);
				clearFields();
				dispatch('notification', { updateTask: t });
			})
			.catch((e) => {
				let errorMessage = 'Failed to update task';
				if (e instanceof AxiosError) {
					if (e.status == 401) logoutAccount();
					errorMessage = e.response?.data.message ?? errorMessage;
				}
				toast.error(errorMessage);
			});
	};

	const submitHandler = () => {
		console.log(`creating task`);
		const newTask: TaskInsert = {
			Task_app_Acronym: currentApp.App_Acronym,
			Task_createDate: newCreateDate.valueOf() / 1000,
			Task_creator: $authStore!.username,
			Task_owner: $authStore!.username,
			Task_description: newTaskDescription,
			Task_name: newTaskName,
			Task_notes: newTaskNotes,
			Task_plan: newTaskPlan,
			Task_state: Task_State.OPEN
		};
		createTask(newTask)
			.then((value) => {
				if (value != null) {
					toast.success(`New task created (${value.Task_id})`);
					clearFields();
					dispatch('notification', { newTask: value });
				}
			})
			.catch((e) => {
				let errorMessage = 'Failed to create task';
				if (e instanceof AxiosError) {
					if (e.status == 401) {
						logoutAccount();
						return;
					}
					errorMessage = e.response?.data.message ?? errorMessage;
				}
				toast.error(errorMessage);
			});
	};

	const clearFields = () => {
		if (newTaskNotes) newTaskNotes = null;
		if (!task) {
			newTaskName = '';
			newTaskDescription = null;
			newTaskPlan = null;
		}
	};
</script>

<Modal bind:showModal>
	<div class="task-canvas">
		<div class="task-banner">
			{#if task}
				{task.Task_id}
			{:else}
				Create Task
			{/if}
		</div>
		<div class="task-form">
			<div class="task-left-form">
				<div class="entry-row">
					<div class="left-container">App Acronym</div>
					<div class="right-container">{currentApp.App_Acronym}</div>
				</div>
				<div class="entry-row">
					<div class="left-container">Task ID</div>
					<div class="right-container">
						{#if task}
							{task.Task_id}
						{:else}
							<span class="hint">--Generated After Creation--</span>
						{/if}
					</div>
				</div>
				<div class="entry-row">
					<div class="left-container">Task Name</div>
					<div class="right-container">
						{#if task}
							{task.Task_name}
						{:else}
							<input bind:value={newTaskName} />
						{/if}
					</div>
				</div>
				<div class="entry-row">
					<div class="left-container">Task Description</div>
					<div class="right-container">
						{#if task}
							<div class="multiline-container">{task.Task_description ?? ''}</div>
						{/if}
						{#if !task}
							<textarea
								style="width: 100%"
								placeholder={'insert description here'}
								bind:value={newTaskDescription}
								rows="6"
							/>
						{/if}
					</div>
				</div>
				<div class="entry-row">
					<div class="left-container">Plan Name</div>
					<div class="right-container">
						<!-- *Default value -->
						{#if !task}
							<select bind:value={newTaskPlan} style="width: 100%">
								<option value={null} selected disabled>select plan</option>
								{#each availablePlans as p}
									<option value={p}>{p} </option>
								{/each}
							</select>
						{/if}
						<!-- *OPEN -->
						{#if task && task.Task_state == Task_State.OPEN}
							{#if $actions.includes(Permit_Enum.OPEN)}
								<select bind:value={newTaskPlan}>
									{#if task.Task_plan}
										<option value={task.Task_plan} disabled>
											{task.Task_plan}
										</option>
									{/if}
									<option value={null}> </option>
									{#each availablePlans.filter((e) => e != task?.Task_plan) as p}
										<option value={p}>
											{p}
										</option>
									{/each}
								</select>
							{/if}
						{/if}
						<!-- *TODO, DOING -->
						{#if task && (task.Task_state == Task_State.TODO || task.Task_state == Task_State.DOING)}
							{#if task.Task_plan}
								{task.Task_plan}
							{:else}
								<div class="hint">-</div>
							{/if}
						{/if}
						{#if task && task.Task_state == Task_State.DONE}
							{#if $actions.includes(Permit_Enum.DONE)}
								<select bind:value={newTaskPlan}>
									{#if task.Task_plan}
										<option value={task.Task_plan} disabled>
											{task.Task_plan}
										</option>
									{/if}
									<option value={null}> </option>
									{#each availablePlans.filter((e) => e != task?.Task_plan) as p}
										<option value={p}>
											{p}
										</option>
									{/each}
								</select>
							{/if}
						{/if}
					</div>
				</div>
				<div class="entry-row">
					<div class="left-container">Task State</div>
					<div class="right-container">
						{#if newTaskState}
							{newTaskState}
						{:else}
							<span class="hint"> - </span>
						{/if}
					</div>
				</div>
				<div class="entry-row">
					<div class="left-container">Task Creator</div>
					<div class="right-container">{$authStore?.username}</div>
				</div>
				<div class="entry-row">
					<div class="left-container">
						Task Create Date
						<div class="hint">(yyyy-mm-dd)</div>
					</div>
					<div class="right-container">{newCreateDateString}</div>
				</div>
			</div>
			<hr />
			<div class="task-right-form">
				<TaskNotesComponent notes={task?.Task_notes} />
				<div class="task-notes-input">
					<textarea
						bind:value={newTaskNotes}
						rows="3"
						placeholder="~ insert notes here ~"
						disabled={!canAddComment}
					/>
				</div>
			</div>
		</div>
		<div class="action-buttons">
			{#if !task}
				<button on:click={submitHandler}>Create Task</button>
			{/if}

			<!-- *OPEN -->
			{#if task && task.Task_state == Task_State.OPEN}
				{#if $actions.includes(Permit_Enum.OPEN)}
					<button
						class="promote-btn"
						on:click={() => {
							newTaskState = Task_State.TODO;
							updateHandler();
						}}>Release Task</button
					>
				{/if}
			{/if}

			<!-- *TODO -->
			{#if task && task.Task_state == Task_State.TODO}
				{#if $actions.includes(Permit_Enum.TODO)}
					<button
						class="promote-btn"
						on:click={() => {
							newTaskState = Task_State.DOING;
							updateHandler();
						}}
					>
						Take On
					</button>
				{/if}
			{/if}

			<!-- *DOING -->
			{#if task && task.Task_state == Task_State.DOING}
				{#if $actions.includes(Permit_Enum.DOING)}
					<button
						class="promote-btn"
						on:click={() => {
							newTaskState = Task_State.DONE;
							updateHandler();
						}}
					>
						To Review
					</button>
					<button
						class="demote-btn"
						on:click={() => {
							newTaskState = Task_State.TODO;
							updateHandler();
						}}
					>
						Forfeit Task
					</button>
				{/if}
			{/if}

			<!-- DONE -->
			{#if task && task.Task_state == Task_State.DONE}
				{#if $actions.includes(Permit_Enum.DONE)}
					<button
						class="promote-btn"
						on:click={() => {
							newTaskState = Task_State.CLOSED;
							updateHandler();
						}}
						disabled={task.Task_plan != newTaskPlan}
					>
						Approve Task
					</button>
					<button
						class="demote-btn"
						on:click={() => {
							newTaskState = Task_State.DOING;
							updateHandler();
						}}
					>
						Reject Task
					</button>
				{/if}
			{/if}

			{#if task}
				<button on:click={updateHandler} disabled={task?.Task_state == Task_State.CLOSED}>
					Save Changes
				</button>
			{/if}
			<button
				on:click={() => {
					showModal = false;
				}}
			>
				Cancel
			</button>
		</div>
	</div>
</Modal>

<style>
	.task-notes-input {
		background-color: #989898;
		display: flex;
		height: 6em;
	}
	textarea {
		resize: none;
		flex: 1;
	}
	.action-buttons {
		margin-top: 20px;
		justify-content: center;
		gap: 20px;
		display: flex;
	}
	.multiline-container {
		overflow-y: auto;
		height: 6em;
		width: 100%;
		background-color: whitesmoke;
	}
	.task-banner {
		height: 60px;
		width: 100%;
		color: white;
		background-color: black;
		font-size: 26;
		font-weight: 700;
		align-content: center;
		text-align: center;
		margin-bottom: 20px;
	}
	.task-canvas {
		min-width: 1000px;
		height: auto;
	}
	.task-form {
		display: flex;
		flex-direction: row;
	}
	.task-left-form {
		flex: 4;
		margin-right: 8px;
		flex-direction: column;
		display: flex;
		gap: 8px;
		justify-content: space-between;
	}
	.task-right-form {
		flex: 7;
		margin-left: 8px;
		flex-direction: column;
		display: flex;
		gap: 10px;
	}

	.entry-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.right-container,
	.left-container {
		font-size: 15;
	}
	.left-container {
		font-weight: 700;
		flex: 4;
	}
	.right-container {
		flex: 7;
		display: flex;
	}
	.hint {
		font-size: 12;
		font-weight: 400;
		color: #989898;
	}

	button.promote-btn {
		background-color: #00a400;
	}
	button.demote-btn {
		background-color: #d02929;
	}
	button.demote-btn:hover {
		background-color: #9d2020;
	}

	button.promote-btn:hover {
		background-color: #007800;
	}

	hr {
		margin: 0px 8px;
	}
	button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
		padding: 10px;
		width: fit-content;
		font-size: 16px;
	}

	button:disabled {
		cursor: not-allowed;
		background: gray;
	}
</style>
