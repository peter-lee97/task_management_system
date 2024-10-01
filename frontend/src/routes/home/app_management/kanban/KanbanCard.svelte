<script lang="ts">
	import type { Plan, Task } from '$models';
	import { Context_Key } from '$services';
	import { getContext, onMount } from 'svelte';
	import { type Readable } from 'svelte/store';
	export let task: Task;
	export let onTap: () => void | undefined;

	const planStore = getContext<Readable<Record<string, Plan>>>(Context_Key.PLAN);

	onMount(() => {
		if (task.Task_plan) {
			const plan = $planStore[task.Task_plan];
			if (!plan || !plan.Plan_color) return;
			const canvasCard = document.getElementById(task.Task_id);
			canvasCard!.style.borderLeft = `4px solid ${plan.Plan_color}`;
			console.log(`plan color: ${plan.Plan_color}`);
		}
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="canvas-card" id={task.Task_id} on:click={onTap}>
	<div class="taskid-style">{task.Task_id}</div>
	<div class="taskname-style">{task.Task_name}</div>
	<div class="taskowner-style">{task.Task_owner}</div>
</div>

<style>
	.canvas-card {
		border-radius: 4px;
		height: 100px;
		background-color: white;
		padding: 8px;
		margin: 8px 0px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.canvas-card:hover {
		cursor: pointer;
		background-color: whitesmoke;
	}
	.taskid-style {
		font-size: 13;
		font-weight: 700;
	}
	.taskname-style {
		font-size: 13;
		white-space: none;
		overflow-y: auto;
		text-overflow: ellipsis;
	}
	.taskowner-style {
		padding: 4px 6px;
		background-color: #0095ff;
		color: white;
		font-size: 12;
		font-weight: 500;
		display: inline-block;
		border-radius: 4px;
		margin-top: auto;
		align-self: flex-start;
	}
</style>
