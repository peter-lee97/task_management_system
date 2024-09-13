<script lang="ts">
	import Fa from 'svelte-fa';
	import { faTrash } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ click: { value: string } }>();

	export let value: string;
	const onTapHandler = () => {
		console.log(`custom ontapHandler called`);
		dispatch('click', {
			value
		});
	};
</script>

<button class="custom-tag" on:click={onTapHandler}>
	<span>{value}</span>
	<Fa icon={faTrash}></Fa>
</button>

<!-- <div class="custom-tag"></div> -->

<style>
	.custom-tag {
		outline-width: 0px;
		display: inline-flex;
		align-items: center;
		border-radius: 12px;
		background-color: lightgrey;
		padding: 4px 8px;
		margin: 0px 2px;
		font-size: 12px;
	}
	.custom-tag:hover {
		background-color: lightcoral;
	}
</style>
