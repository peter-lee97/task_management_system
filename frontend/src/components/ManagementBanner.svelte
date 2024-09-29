<script lang="ts">
	export let title: string;
</script>

<div class="banner">
	<h1>{title}</h1>
	{#if $$slots.action}
		<slot name="action" />{/if}
</div>

<style>
	div.banner {
		display: flex;
		padding: 0px 10px;
		align-items: center;
		justify-content: space-between;
	}
</style>
