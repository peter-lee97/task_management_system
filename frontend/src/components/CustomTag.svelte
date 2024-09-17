<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ click: { value: string } }>();
	export let value: string;
	export let enable: boolean;
	const onTapHandler = () => {
		console.log(`custom ontapHandler called`);
		dispatch('click', {
			value
		});
	};
</script>

<button class="custom-tag" on:click={onTapHandler} disabled={!enable}>
	<span class="text-tag">{value}</span>
</button>

<style>
	.custom-tag,
	.custom-tag:disabled {
		outline-width: 0px;
		display: inline-flex;
		align-items: center;
		border-radius: 12px;
		background-color: rgb(238, 238, 238);
		padding: 4px 8px;
		gap: 4px;
		font-size: 12px;
		border: none;
		margin-right: 4px;
		color: black;
	}

	.custom-tag:not(:disabled) {
		background-color: rgb(215, 215, 215);
	}

	.custom-tag:hover:not(:disabled) {
		background-color: lightcoral;
	}

	.text-tag {
		margin-right: 4px;
	}
</style>
