<script lang="ts">
	export let notes: string | null | undefined;
</script>

<span>Task Note</span>
<div class="notes-canvas">
	{#if notes}
		<textarea bind:value={notes} readonly />
	{:else}
		<textarea readonly />
	{/if}
</div>

<style>
	textarea {
		resize: none;
		flex: 1;
		background-color: #d8d8d8;
		height: 26em;
	}
	span {
		font-weight: 700;
	}
	.notes-canvas {
		background-color: aqua;
		display: flex;
	}
</style>
