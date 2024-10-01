<script lang="ts">
	import { onDestroy, onMount, setContext } from 'svelte';
	import { applicationStore, selectedIndexStore, userActionStore } from '$lib/appStore';
	import ManagementBanner from '$components/ManagementBanner.svelte';
	import {
		Context_Key,
		fetchPlans,
		fetchTasks,
		Permit_Enum as Permit_Enum,
		Task_State
	} from '$services';
	import type { Application, Plan, Task } from '$models';
	import KanbanCard from './KanbanCard.svelte';
	import PlanCard from './PlanCard.svelte';
	import { writable } from 'svelte/store';
	import TaskModal from './TaskModal.svelte';

	let canCreatePlan = false;
	let canCreateTask = false;
	let showCreateTaskModal = false;
	let showPlanModal = false;
	let showTaskModal = false;
	let currentApp: Application;
	let currentTask: Task | undefined;
	let writableTasks = writable<Task[]>(new Array(0));
	let writablePlans = writable<Record<string, Plan>>({});

	$: {
		if (!showTaskModal) currentTask = undefined;
	}

	writableTasks.subscribe((e) => {
		console.log(`change in tasks`);
		e.map((e) => `${e.Task_name} | ${e.Task_plan}`).forEach((e) => console.log(e));
	});

	userActionStore.subscribe((actions) => {
		console.log(`actions: ${actions}`);
	});

	$: openTasks = $writableTasks.filter((t) => t.Task_state == Task_State.OPEN);
	$: todoTasks = $writableTasks.filter((t) => t.Task_state == Task_State.TODO);
	$: doingTasks = $writableTasks.filter((t) => t.Task_state == Task_State.DOING);
	$: doneTasks = $writableTasks.filter((t) => t.Task_state == Task_State.DONE);
	$: closeTasks = $writableTasks.filter((t) => t.Task_state == Task_State.CLOSE);

	setContext(Context_Key.PLAN, writablePlans);
	setContext(Context_Key.ACTIONS, userActionStore);
	setContext(Context_Key.TASK, writableTasks);

	const userActionsSub = userActionStore.subscribe((values) => {
		if (!values) return;
		canCreatePlan = values.includes(Permit_Enum.CREATE_PLAN);
		canCreateTask = values.includes(Permit_Enum.CREATE_TASK);
	});

	onMount(async () => {
		if ($selectedIndexStore != null) {
			currentApp = $applicationStore[$selectedIndexStore];
			if (currentApp) {
				userActionStore.fetch(currentApp.App_Acronym);
				await fetchPlans(currentApp.App_Acronym).then((results) => {
					const r: Record<string, Plan> = {};
					results.forEach((e) => {
						r[e.Plan_MVP_name] = e;
					});
					writablePlans.set(r);
				});
				fetchTasks(currentApp.App_Acronym).then((results) => {
					writableTasks.set(results);
				});
			}
		}
	});

	onDestroy(() => {
		userActionStore.fetch();
		userActionsSub();
		console.log(`destroy kanban screen`);
	});

	const createTaskHandler = () => {
		showCreateTaskModal = !showCreateTaskModal;
	};
	const editTaskHandler = (task: Task) => {
		showTaskModal = !showTaskModal;
		currentTask = task;
	};
</script>

<ManagementBanner title="Task Management Board">
	<div slot="action">
		{#if canCreatePlan}
			<button class="system-button" on:click={() => (showPlanModal = !showPlanModal)}>
				+ Create Plan
			</button>
		{/if}
	</div>
</ManagementBanner>

{#if showTaskModal && currentTask}
	<TaskModal
		on:notification={(event) => {
			const updatedTask = event.detail.updateTask;
			if (!updatedTask) return;

			console.log(`updated task plan: ${updatedTask.Task_plan}`);

			writableTasks.update((tasks) => {
				const newTasks = tasks.filter((t) => t.Task_id !== updatedTask.Task_id);
				return [updatedTask, ...newTasks];
			});
		}}
		bind:showModal={showTaskModal}
		bind:selectedTaskId={currentTask.Task_id}
		{currentApp}
	/>
{/if}

<div class="grid-container">
	<div class="grid-item">
		<div
			style="display: flex;
					justify-content: space-between;"
		>
			<div class="grid-title">Open</div>
			{#if canCreateTask}
				<button class="col-button" on:click={createTaskHandler}>+ Create Task</button>
			{/if}
		</div>
		<div class="kanban-builder">
			{#each openTasks as t (t.Task_name + t.Task_id + t.Task_plan + t.Task_createDate)}
				<KanbanCard task={t} onTap={() => editTaskHandler(t)} />
			{/each}
		</div>
	</div>

	<div class="grid-item">
		<div class="grid-title">To do</div>
		<div class="kanban-builder">
			{#each todoTasks as t (t.Task_name + t.Task_id + t.Task_plan + t.Task_createDate)}
				<KanbanCard
					task={t}
					onTap={() => {
						editTaskHandler(t);
					}}
				/>
			{/each}
		</div>
	</div>
	<div class="grid-item">
		<div class="grid-title">Doing</div>
		<div class="kanban-builder">
			{#each doingTasks as t (t.Task_name + t.Task_id + t.Task_plan + t.Task_createDate)}
				<KanbanCard
					task={t}
					onTap={() => {
						editTaskHandler(t);
					}}
				/>
			{/each}
		</div>
	</div>
	<div class="grid-item">
		<div class="grid-title">Done</div>
		<div class="kanban-builder">
			{#each doneTasks as t (t.Task_name + t.Task_id + t.Task_plan + t.Task_createDate)}
				<KanbanCard
					task={t}
					onTap={() => {
						editTaskHandler(t);
					}}
				/>
			{/each}
		</div>
	</div>
	<div class="grid-item">
		<div class="grid-title">Closed</div>
		<div class="kanban-builder">
			{#each closeTasks as t (t.Task_name + t.Task_id + t.Task_plan + t.Task_createDate)}
				<KanbanCard
					task={t}
					onTap={() => {
						editTaskHandler(t);
					}}
				/>
			{/each}
		</div>
	</div>
</div>

{#if showCreateTaskModal}
	<TaskModal
		showModal={showCreateTaskModal}
		{currentApp}
		on:notification={(event) => {
			if (event.detail.newTask) {
				const newTask = event.detail.newTask;
				writableTasks.update((prev) => {
					return [newTask, ...prev];
				});
			}
		}}
	/>
{/if}
{#if currentApp && showPlanModal}
	<PlanCard appAcronym={currentApp.App_Acronym} showModal={showPlanModal} />
{/if}

<style>
	.kanban-builder {
		overflow-y: auto;
		height: 100%;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
		padding: 10px;
		height: 100%;
	}

	.grid-item {
		background-color: #d8d8d8;
		padding: 8px 8px;
		flex-direction: column;
		display: flex;
		max-height: 50em;
	}

	.grid-title {
		font-size: 15;
		font-weight: 700;
	}

	button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
	}
	button.col-button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
		font-weight: 400;
	}

	button.system-button {
		font-size: 16px;
		font-weight: 400;
		padding: 10px;
	}
</style>
