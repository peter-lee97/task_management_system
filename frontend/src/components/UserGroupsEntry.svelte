<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { UserGroup } from '../model';
	import CustomTag from './CustomTag.svelte';

	const dispatch = createEventDispatcher<{ select_group: string }>();

	function onClickHandler(selectedGroup: string) {
		dispatch('select_group', selectedGroup);
	}

	export let groups: Iterable<string>;
	export let canEdit: boolean;
</script>

<div class="group-list">
	{#each Object.entries(groups) as [_, group]}
		<div class="group-item">
			<CustomTag
				enable={canEdit}
				on:click={(_s) => {
					onClickHandler(group);
				}}
				value={group}
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
