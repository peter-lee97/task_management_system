<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { UserGroup } from '../model';
	import CustomTag from './CustomTag.svelte';

	const dispatch = createEventDispatcher<{ select_group: UserGroup }>();

	function onClickHandler(selectedGroup: UserGroup) {
		dispatch('select_group', selectedGroup);
	}

	export let groups: UserGroup[];
</script>

<div class="group-list">
	{#each Object.entries(groups) as [_, group]}
		<div class="group-item">
			<CustomTag
				on:click={(value) => {
					onClickHandler(group);
				}}
				value={group.user_group}
			/>
		</div>
	{/each}
</div>

<style>
	.group-list {
		display: inline-flex;
		width: 300px;
		max-height: 100px;
		overflow-y: auto;
		padding: 10px;
		box-sizing: border-box;
	}
</style>
