<script lang="ts">
	import type { Application } from '$models';
	import { toDateString } from '$services';
	export let app: Application;
	export let onEdit: (() => void) | null;
	export let onTap: () => void;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="application-layout" on:click={onTap}>
	<div class="application-layout-left">
		<div>
			<div class="entry-row">
				<div class="title">App Acronym</div>
				<div class="content">{app.App_Acronym}</div>
			</div>
			<div class="entry-row">
				<div class="title">App Description</div>
				<div class="content description">
					{#if app.App_Description}
						{app.App_Description}
					{/if}
				</div>
			</div>
			<div class="entry-row">
				<div class="title">Start Date</div>
				<div class="content">{toDateString(app.App_startDate * 1000)}</div>
			</div>
			<div class="entry-row">
				<div class="title">End Date</div>
				<div class="content">{toDateString(app.App_endDate * 1000)}</div>
			</div>
		</div>
	</div>
	{#if onEdit}
		<div class="application-layout-right">
			<button on:click|stopPropagation={onEdit}>Edit</button>
		</div>
	{/if}
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
	.application-layout {
		background-color: #d8d8d8;
		padding: 8px;
		display: flex;
		gap: 18px;
		cursor: pointer;
	}
	.application-layout-left {
		flex: 9;
	}
	.application-layout-right {
		flex: 1;
		text-align: right;
	}
	.entry-row {
		display: flex;
		gap: 8px;
		width: 100%;
		align-items: start;
		margin-bottom: 8px;
	}
	.title {
		max-width: 100px;
		min-height: 20px;
		flex: 4;
		font-weight: 700;
		align-items: start;
	}
	.content {
		align-items: start;
		flex: 6;
	}
	.title,
	.content {
		display: flex;
		min-height: 20px;
	}
	.content.description {
		overflow-y: auto;
		overflow-x: hidden;
		height: 8.5em;
		position: relative;
	}
</style>
